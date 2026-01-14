# SSL_GUIDE.md

## Краткая цель
Дать формально точное, но визуально понятное объяснение, как работает HTTPS, сертификаты и TLS‑рукопожатие.

---

## 1) Что такое сертификат (X.509) — формальная структура

Сертификат — это структура ASN.1. В упрощённом виде:

```
Certificate ::= SEQUENCE {
  tbsCertificate       TBSCertificate,  // данные, которые подписываются
  signatureAlgorithm   AlgorithmIdentifier,
  signatureValue       BIT STRING        // подпись CA
}
```

**TBSCertificate** включает:
- Subject (кому выдан): домен
- SubjectPublicKeyInfo: публичный ключ сервера
- Validity: срок действия
- Extensions: SubjectAltName, KeyUsage, BasicConstraints и т.д.

Итого: сертификат = **(данные) + подпись CA над этими данными**.

---

## 2) Подпись сертификата (не абстракция)

Пусть CA имеет ключи:
- `sk_CA` — приватный
- `pk_CA` — публичный

CA вычисляет:
```
sig = Sign(sk_CA, Hash(tbsCertificate))
```

Клиент проверяет:
```
Verify(pk_CA, sig, Hash(tbsCertificate)) == true
```

Если проверка прошла — данные не подделаны и домен действительно связан с этим публичным ключом.

---

## 3) Цепочка сертификатов (почему не один)

Обычно сайт присылает:
1) **Leaf**: сертификат сайта (domain → public key)
2) **Intermediate**: подписал leaf
3) **Root**: доверенный корневой CA (уже в браузере)

Проверка:
```
Verify(pk_intermediate, leaf_sig)
Verify(pk_root, intermediate_sig)
pk_root доверен заранее (в браузере/OS)
```

Файл `fullchain.pem` = leaf + intermediate.

---

## 4) TLS 1.3 по шагам (сетевой взгляд)

### 4.1 TCP
```
SYN  -> 
<- SYN/ACK
ACK  ->
```

### 4.2 TLS Handshake

**ClientHello** (открыто):
- TLS версия
- cipher suites
- random
- SNI (домен)
- key_share (ECDHE public)
- signature_algorithms, ALPN

**ServerHello** (открыто):
- выбранный cipher suite
- random
- key_share сервера

Дальше всё **шифруется**:
- EncryptedExtensions
- Certificate (leaf + intermediate)
- CertificateVerify
- Finished

---

## 5) Обмен ключами (ECDHE) строго

Пусть группа `G` и генератор `g`.

Клиент:
```
a ← random
A = g^a
```

Сервер:
```
b ← random
B = g^b
```

Общий секрет:
```
S = B^a = A^b = g^(ab)
```

Далее:
```
K = HKDF(S || transcript)
```

**K** — симметричный ключ шифрования трафика.

---

## 6) Где участвует сертификат

Сертификат **не шифрует** трафик.  
Он только **доказывает**, что публичный ключ действительно принадлежит домену.

А шифрование выполняется **симметричным ключом**, полученным из ECDHE.

---

## 7) Как certbot получает сертификат (ACME HTTP‑01)

1) Certbot запрашивает у CA challenge.  
2) CA выдаёт токен `T`.
3) Certbot размещает `T` по пути:
   ```
   http://<domain>/.well-known/acme-challenge/T
   ```
4) CA проверяет доступность.
5) Выдаёт сертификат → `/etc/letsencrypt/live/<domain>/`.

**Почему нужен 80 порт:** CA проверяет токен через HTTP.

---

## 8) Где хранится и как используется сертификат

Файлы:
```
/etc/letsencrypt/live/<domain>/fullchain.pem
/etc/letsencrypt/live/<domain>/privkey.pem
```

Nginx читает эти файлы и использует в TLS:
```
ssl_certificate     fullchain.pem
ssl_certificate_key privkey.pem
```

---

## 9) Практическая диагностика

DNS:
```
dig +short musikschule-cms-bielefeld.de
```

Сертификат:
```
openssl x509 -in /etc/letsencrypt/live/<domain>/fullchain.pem -noout -enddate
```

TLS проверка:
```
openssl s_client -connect <domain>:443 -servername <domain>
```

Логи certbot:
```
/var/log/letsencrypt/letsencrypt.log
```

---

Если хотите, добавлю отдельный раздел с **байтовым разбором ClientHello/ServerHello** и примером hex‑дампа.
