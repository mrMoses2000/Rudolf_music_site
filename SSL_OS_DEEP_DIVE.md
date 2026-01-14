# SSL_OS_DEEP_DIVE.md

## Назначение
Максимально детальное пособие: как HTTPS/сертификаты/TLS работают «под капотом» на Ubuntu с Docker + Nginx, вплоть до сетевого стека ядра и системных вызовов.

---

## 0) Карта компонентов (на сервере)

**User space**
- `run.sh` — orchestration скрипт
- `certbot` — ACME‑клиент (получает/обновляет сертификаты)
- `docker`/`containerd` — управление контейнером
- `nginx` — HTTP/TLS сервер в контейнере
- `cron` — периодический запуск обновления сертификатов

**Kernel space**
- Сетевой стек Linux (TCP/IP)
- Netfilter (iptables/nftables)
- VFS/FS (ext4/xfs) и page cache
- Namespace/CGroups для контейнеров

---

## 1) Файлы сертификатов: как ОС их видит

Путь:
```
/etc/letsencrypt/live/<domain>/fullchain.pem
/etc/letsencrypt/live/<domain>/privkey.pem
```

Что происходит:
1) Nginx стартует и вызывает `open()` на эти файлы.
2) VFS ищет inode, читает блоки с диска (или из page cache).
3) OpenSSL парсит PEM → строит внутренние структуры `X509`, `EVP_PKEY`.

**Проблемы здесь:**
- неверные права на файлы
- файлов нет
- контейнер не видит `/etc/letsencrypt` (нет mount)

---

## 2) ACME / certbot: процесс получения сертификата

### 2.1 Основной поток
1) certbot создаёт ACME‑аккаунт (ключи клиента).
2) Запрашивает сертификат для домена.
3) Получает challenge HTTP‑01.
4) Поднимает **временный HTTP‑сервер** на 80 порту.
5) Let’s Encrypt делает HTTP‑запрос на:
   `http://<domain>/.well-known/acme-challenge/<token>`
6) Если ответ совпал — выдаёт сертификат.

### 2.2 На уровне ОС
certbot вызывает:
- `socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)`
- `bind(fd, 0.0.0.0:80)`
- `listen(fd, backlog)`
- `accept4()` для каждого запроса
- `send()` токен и закрывает соединение

**Важно:** 80 порт должен быть свободен (поэтому контейнер останавливается).

---

## 3) Docker port mapping (как 80/443 попадают в контейнер)

При `docker run -p 80:80 -p 443:443` Docker:
- создаёт **veth‑пару**
- создаёт сетевой namespace для контейнера
- добавляет **iptables DNAT** (или nftables ruleset)

Схема:
```
Интернет -> eth0(host) -> netfilter PREROUTING (DNAT) -> veth -> container -> nginx
```

Инструменты проверки:
```
sudo ip a
sudo ip link
sudo iptables -t nat -S | rg 80
sudo nft list ruleset
```

**docker-proxy**:
В некоторых конфигурациях Docker запускает `docker-proxy`, который слушает порт и пересылает в контейнер. Это видно в `lsof`.

---

## 4) Путь входящего пакета (Linux kernel)

1) NIC получает кадр (DMA).
2) Драйвер поднимает NAPI → создаёт `struct sk_buff`.
3) Пакет идёт в сетевой стек:
   - L2 → L3 → L4
4) netfilter hooks:
   - PREROUTING
   - CONNTRACK
   - DNAT
5) Маршрутизация → FORWARD
6) Выход в veth контейнера

**Ключевые структуры ядра:**
- `struct sk_buff` — буфер пакета
- `struct net_device` — интерфейс
- `struct sock` / `struct tcp_sock` — сокет и TCP‑состояние
- conntrack table

---

## 5) Принятие соединения nginx (epoll)

1) `nginx` создаёт слушающий сокет (`socket`, `bind`, `listen`).
2) Рабочий процесс регистрирует FD в `epoll`.
3) При новом соединении `epoll_wait` возвращает событие.
4) `accept4()` → новый socket FD.
5) Nginx вызывает OpenSSL TLS‑handshake на этом сокете.

**Событийная модель:** epoll + неблокирующие сокеты.

---

## 6) TLS 1.3 — внутренняя механика в OpenSSL

### 6.1 Ключевые шаги
1) `ClientHello` (открыто)
2) `ServerHello` (открыто)
3) Дальше — зашифровано:
   - EncryptedExtensions
   - Certificate
   - CertificateVerify
   - Finished

### 6.2 ECDHE
Сервер и клиент обмениваются ключами:
```
S = g^(ab)
K = HKDF(S || transcript)
```
После этого все HTTP данные шифруются симметрично.

### 6.3 OpenSSL внутри nginx
Nginx вызывает:
- `SSL_accept()`
  - читает ClientHello
  - выбирает cipher suite
  - формирует ServerHello
  - отправляет Certificate/Finished
- затем `SSL_read()` / `SSL_write()`

---

## 7) Формирование TLS‑пакета (микро‑уровень)

Каждое сообщение TLS упаковывается в **TLS record**:
```
struct tls_record {
  uint8_t  content_type;   // 0x17 (application data)
  uint16_t legacy_version; // 0x0303
  uint16_t length;
  uint8_t  encrypted_payload[length];
}
```

Далее TLS‑record идёт в TCP сегмент, который идёт в IP пакет.

---

## 8) Где шифруются данные

Все HTTP данные (запросы/ответы) становятся `TLS Application Data` и шифруются:
- AES‑GCM или ChaCha20‑Poly1305
- Включают MAC/AEAD‑тег

---

## 9) Что делает cron‑обновление

`/etc/cron.d/music_school_ssl_renew` запускает:
`/usr/local/bin/renew_music_school_ssl.sh`

Скрипт:
1) Проверяет дату истечения сертификата (`openssl x509 -checkend`)
2) Если скоро истекает → останавливает контейнер
3) Запускает certbot → получает новый сертификат
4) Запускает контейнер снова

---

## 10) Диагностика на уровне ОС

Сокеты:
```
sudo ss -tulpn
```

Таблица NAT:
```
sudo iptables -t nat -S
```

Живой TCP трафик:
```
sudo tcpdump -i eth0 port 443
```

Проверка TLS:
```
openssl s_client -connect <domain>:443 -servername <domain>
```

---

## 11) Где ломается чаще всего

1) DNS не указывает на сервер → certbot не проходит HTTP‑01  
2) 80 закрыт → certbot не работает  
3) Nginx не видит сертификат (mount нет)  
4) Истёк сертификат → браузер ругается  
5) Ошибка цепочки → неправильный `fullchain.pem`

---

Если хотите, добавлю **байтовый разбор ClientHello/ServerHello** и трассу `tcpdump` с декодированием каждого поля.
