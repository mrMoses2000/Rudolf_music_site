# SSL_OS_DEEP_DIVE.md — TLS/HTTPS «под капотом» ОС (Ubuntu + Docker + Nginx)

Цель: объяснить, какие процессы, системные вызовы и структуры ядра задействованы при HTTPS, и как это связано с криптографией.

---

## 0) Уровни и границы ответственности

**User space:** nginx, OpenSSL, certbot, docker, cron.  
**Kernel space:** TCP/IP стек, netfilter, файловые системы, планировщик, драйверы NIC.

**Причина‑следствие:**
- TLS реализован в user space (OpenSSL).  
- Передача пакетов, буферы, очереди, retransmit — ядро.  
- Сертификаты — файлы на FS → читаются OpenSSL.  

---

## 1) От пакета до HTTP (TCP + TLS)

### 1.1 Сетевой путь
1) **NIC** принимает фрейм (DMA) → драйвер.
2) **NAPI** формирует `struct sk_buff`.
3) L2/L3/L4 в ядре обрабатывают пакет.
4) netfilter (PREROUTING → DNAT → FORWARD).
5) Сегменты попадают в TCP reassembly queue.
6) TCP отдаёт байты сокету (receive queue).

### 1.2 Ключевые структуры ядра
- `struct sk_buff` — контейнер для пакета в Linux (метаданные + payload).
- `struct sock` / `struct tcp_sock` — состояние TCP‑сокета (окна, очереди, таймеры).
- `struct net_device` — интерфейс (eth0), таблицы адресов, MTU.
- RX/TX ring buffers — кольцевые буферы у драйвера NIC.

**Следствие:** даже «один пакет» проходит несколько очередей и структур, прежде чем окажется в user space.

### 1.3 RX‑путь (подробно)
1) NIC пишет данные в RX ring через DMA.
2) Драйвер вызывает softirq → NAPI poll.
3) Создаётся `sk_buff`, заполняются указатели на L2/L3/L4.
4) GRO (Generic Receive Offload) может объединить сегменты.
5) `ip_rcv()` → `tcp_v4_rcv()`.
6) TCP проверяет sequence/ACK, кладёт байты в receive queue.
7) Сокет становится «readable» → `epoll` будит процесс.

### 1.4 TX‑путь (подробно)
1) `nginx` вызывает `write()`/`sendfile()`.
2) Ядро создаёт `sk_buff` и помещает данные в send queue.
3) TCP сегментирует, ставит sequence/ACK.
4) Qdisc (fq_codel и т.п.) решает порядок отправки.
5) Драйвер помещает пакеты в TX ring → NIC отправляет.

### 1.5 Передача в user space
- `nginx` ждёт через `epoll_wait()`.
- `accept4()` возвращает новый сокет.
- `read()` даёт TLS‑записи (байты), которые OpenSSL парсит.

**Следствие:** всё шифрование/проверка подписи — в user space, не в ядре.

---

## 2) TLS‑рукопожатие на уровне системных вызовов

1) `socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)`
2) `bind()` + `listen()`
3) `accept4()`
4) `SSL_accept()` (OpenSSL)
   - `read()` → ClientHello
   - вычисления (ECDHE, HKDF)
   - `write()` → ServerHello/Certificate/Finished

**Причина:** TLS — протокол поверх TCP, поэтому всё идёт через сокеты и системные вызовы.

### 2.1 Где CPU и память
- **ECDHE/подписи** выполняются в user space (OpenSSL) и нагружают CPU.
- **Копирование буферов**: kernel → user (`copy_to_user`).
- **Page cache** ускоряет чтение файлов сертификата.

**Следствие:** узким местом может быть CPU (криптография) или память (копирование), а не сеть.

---

## 3) Файлы сертификатов и чтение из ФС

Файлы:
```
/etc/letsencrypt/live/<domain>/fullchain.pem
/etc/letsencrypt/live/<domain>/privkey.pem
```

Как читает OpenSSL:
1) `open()` → fd
2) `read()` → байты
3) парсинг PEM → ASN.1 DER → структуры X509/EVP

**Причина:** без корректного чтения этих файлов сервер не может завершить TLS handshake.

### 3.1 Page cache и sendfile
`sendfile()` позволяет читать из page cache и отправлять в сокет без лишнего копирования.
Для статических файлов это ускоряет отдачу и снижает нагрузку CPU.

---

## 4) Docker и проброс портов

`docker run -p 80:80 -p 443:443`:
- создаёт veth‑пару
- добавляет DNAT‑правила
- иногда запускает `docker-proxy`

Схема:
```
Интернет -> host eth0 -> netfilter (DNAT) -> veth -> container -> nginx
```

**Следствие:** если DNAT не работает — пакеты не доходят до nginx.

### 4.1 Где могут быть проблемы
- Правила nftables/iptables отсутствуют.
- `docker-proxy` не запущен.
- Контейнер слушает 443, но проброс только 80.

---

## 5) TLS записи, AEAD и ядро

TLS‑record шифруется в user space и передаётся в TCP:
```
TLS record -> write() -> TCP -> IP -> NIC
```

**Причина‑следствие:**
- TCP не знает о TLS.
- Ядро не видит HTTP, оно видит байты TLS.

### 5.1 AEAD на уровне данных
Современные шифры TLS 1.3 — это AEAD (например, AES‑GCM).
Каждая запись имеет **тег аутентичности**, ядро его не проверяет — это делает OpenSSL.

---

## 6) HTTP/2 и HTTP/3

### HTTP/2
- Работает поверх TLS/TCP.
- Мультиплексирование запросов по одному соединению.

### HTTP/3 (QUIC)
- TLS 1.3 встроен в QUIC.
- Поверх UDP, своя retransmit‑логика.

**Следствие:** для HTTP/3 нужен иной сетевой стек (обычно через CDN).

---

## 7) certbot и ACME — на уровне процессов

1) cron запускает `/usr/local/bin/renew_music_school_ssl.sh`
2) certbot поднимает временный HTTP‑сервер:
   - `socket()` → `bind()` на 80 → `listen()`
3) CA делает запрос → certbot отдаёт challenge
4) certbot пишет новые файлы сертификата

### 7.1 Что видит ядро
Для ядра certbot — это просто процесс, который:
- `listen()` на 80
- `accept()` соединение
- `read()` запрос
- `write()` ответ
Вся «магия» ACME для ядра — обычные HTTP‑запросы.

---

## 8) Диагностика (причинно‑следственные проверки)

- Проверка слушающих портов:
```
sudo ss -tulpn
```
- Проверка DNAT:
```
sudo iptables -t nat -S
```
- Проверка сертификата:
```
openssl x509 -in /etc/letsencrypt/live/<domain>/fullchain.pem -noout -enddate
```
- Проверка TLS:
```
openssl s_client -connect <domain>:443 -servername <domain>
```

---

## 9) Cloudflare как промежуточный TLS‑узел

Когда включён Cloudflare:
```
Клиент <—TLS—> Cloudflare <—TLS—> Origin
```

**Причина‑следствие:**
- Клиент получает сертификат Cloudflare.
- Cloudflare открывает свою TLS‑сессию к вашему серверу.
- Ваш сервер всё ещё обязан иметь валидный сертификат (Full strict).

---

Это системная картина. Для строгой математики см. `SSL_GUIDE.md`.
