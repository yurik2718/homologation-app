# Деплой / Deploy Guide

Инструкция для production-запуска. Состоит из двух частей:
**Часть 1** — что должен собрать заказчик.
**Часть 2** — что делает разработчик.

---

## Часть 1. Для заказчика

Заполните таблицу и отправьте разработчику. Заведение аккаунтов Stripe/OAuth занимает время (особенно верификация Stripe: 1–3 рабочих дня) — начинайте заранее.

### 🔴 Обязательное для запуска

| # | Что нужно | Пример | Где взять | Готово? |
|---|-----------|--------|-----------|---------|
| 1 | Домен + доступ к DNS-панели | `spaceforedu.com` | Namecheap / GoDaddy / Reg.ru | ☐ |
| 2 | VPS-сервер (Ubuntu 22.04+, 2 GB RAM) | `123.45.67.89` | Hetzner / DigitalOcean / Timeweb | ☐ |
| 3 | WhatsApp номер (с кодом страны, без `+`) | `34663689393` | — | ☐ |
| 4 | Контактный email | `info@spaceforedu.com` | Ваша почта | ☐ |
| 5 | Email поддержки | `support@spaceforedu.com` | Ваша почта | ☐ |
| 6 | Telegram-хэндл (без `@`) | `spaceforedu` | Ваш профиль | ☐ |
| 7 | Stripe-аккаунт (верифицированный) | — | См. инструкцию ниже | ☐ |
| 8 | Google OAuth (Sign in with Google) | — | См. инструкцию ниже | ☐ |
| 9 | SMTP для отправки email | — | Gmail App Password / Postmark | ☐ |

### 🟡 Опционально (можно добавить после запуска)

| # | Что | Зачем |
|---|-----|-------|
| 10 | Facebook OAuth | Кнопка "Войти через Facebook" |
| 11 | Telegram Bot | Уведомления клиентам в Telegram |
| 12 | AmoCRM | Автосинхронизация заявок после оплаты |
| 13 | Google Analytics / Яндекс.Метрика | Через единый GTM (см. `docs/20_SEO_ANALYTICS.md`) |
| 14 | Sentry | Трекинг ошибок (бесплатный план покрывает старт) |
| 15 | Реальные отзывы (3 шт.) + фото команды | **Важно** до запуска рекламы — см. комментарии в аудите |

---

### Инструкция: Миграция домена (15–30 минут)

Домен уже куплен и, возможно, используется для старого приложения. 3 варианта:

**Вариант А — Мгновенная замена** (старое приложение больше не нужно)

1. Задеплойте новое приложение (Часть 2), убедитесь что работает по IP.
2. DNS-панель регистратора → A-запись `@` (или `spaceforedu.com`) → IP нового сервера.
3. Подождите 5–30 мин (в редких случаях до 24 ч), зависит от TTL.

**Вариант Б — Плавный переход** (старое остаётся на поддомене)

1. Задеплойте новое.
2. Создайте `old.spaceforedu.com` → IP старого сервера.
3. Перенастройте старое приложение на `old.spaceforedu.com`.
4. Смените основную A-запись на IP нового.

**Вариант В — Тестирование на поддомене перед переключением** (безопаснее всего)

1. Создайте `app.spaceforedu.com` → IP нового сервера.
2. Протестируйте всё на `app.spaceforedu.com`.
3. Когда готово — переключите основную A-запись.

> **Рекомендация:** Вариант В. Старый сайт продолжает работать, вы спокойно тестируете новый.

### Инструкция: Stripe (10–15 минут активной работы + 1–3 дня верификации)

Приложение использует Stripe **двумя способами**:

**(a)** — Payment Link для платной консультации на публичных страницах (без регистрации).
**(b)** — Stripe Checkout для оплаты услуг из личного кабинета (после регистрации заявки).

Оба требуют одного Stripe-аккаунта.

#### Шаги

1. Зарегистрируйтесь на [stripe.com](https://stripe.com), пройдите верификацию бизнеса (имя, адрес, банковский счёт) — **1–3 рабочих дня**.
2. **Создайте Payment Link для консультации:**
   - Dashboard → **Payment Links** → **+ New**
   - Продукт: "Expert Consultation", цена **100 €** (или ваша), разовый платёж.
   - **After payment** → Redirect → `https://ваш-домен.com/es/consultation-thank-you`
   - Включите сбор email и телефона.
3. **Включите автоматические чеки:** Settings → Emails → Successful payments.
4. **Отправьте разработчику:**
   - **Payment Link URL** (начинается с `https://buy.stripe.com/...`)
   - **Live Secret Key** из Dashboard → Developers → API keys → **Reveal live key** (`sk_live_...`)
   - Webhook Signing Secret настроится после деплоя (см. Часть 2, шаг «После деплоя»).

### Инструкция: Google OAuth (10 минут)

1. [Google Cloud Console](https://console.cloud.google.com) → создайте проект.
2. **APIs & Services** → **OAuth consent screen** → External → заполните (название, email, логотип).
3. **Credentials** → **+ Create Credentials** → **OAuth client ID** → Web application.
4. **Authorized redirect URI:** `https://ваш-домен.com/auth/google_oauth2/callback`
5. Отправьте разработчику **Client ID** и **Client Secret**.

### Инструкция: Facebook OAuth — опционально (10 минут, бесплатно)

1. [developers.facebook.com](https://developers.facebook.com) → My Apps → Create App → **Consumer**.
2. Добавьте продукт **Facebook Login** → Web.
3. **Valid OAuth Redirect URIs:** `https://ваш-домен.com/auth/facebook/callback`
4. **Settings** → Basic → скопируйте **App ID** и **App Secret**.
5. Чтобы логин работал для всех (не только админов) — в верхней панели кнопка **Go Live**.
6. Отправьте разработчику **App ID** и **App Secret**.

### Инструкция: Email / SMTP

**Gmail (бесплатно, подходит для старта):**

1. [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → создайте App Password для "Mail".
2. Отправьте разработчику: адрес Gmail + сгенерированный пароль (16 символов).

**Postmark / Mailgun / Resend (для бизнеса):** отправьте SMTP host, port (587), login, password.

> **Важно для deliverability:** после деплоя настройте SPF / DKIM / DMARC DNS-записи для домена, иначе письма полетят в спам. Разработчик подскажет точные значения для вашего SMTP-провайдера.

---

## Часть 2. Для разработчика

### Что уже настроено в репозитории

- **Dockerfile** — production-ready, multi-stage (Node + Vite + Rails).
- **`config/deploy.yml`** — Kamal-конфиг, нужно заполнить IP, домен, registry.
- **`.kamal/secrets`** — уже содержит `RAILS_MASTER_KEY=$(cat config/master.key)`. **НЕ перезаписывайте файл целиком** — дополняйте через `>>`.
- **`config/environments/production.rb`** — SSL / force_ssl / host authorization / SMTP включаются, когда установлен `APP_HOST`.
- **`bin/setup`** — для локальной разработки копирует `.env.example` → `.env`. В **production** `.env` **не используется** — переменные идут через Kamal (`deploy.yml` → `env.clear` и `.kamal/secrets`).
- **Аліасы Kamal** (`bin/kamal console/logs/shell/dbc/backup`) — уже определены в `deploy.yml`.
- **`DatabaseBackupJob`** — запускается через `bin/kamal backup`.
- **SQLite + Solid Queue/Cache/Cable** — без внешних БД. Данные в volume `homologation_app_storage:/rails/storage`.

### Что нужно заполнить перед первым деплоем

Три места: **`config/deploy.yml`**, **Rails credentials**, **`.kamal/secrets`** (если нужен Sentry backend).

#### Шаг 1. `config/deploy.yml` — сервер, домен, registry, env

```yaml
# Строка 10: IP сервера
servers:
  web:
    - 123.45.67.89          # ← РЕАЛЬНЫЙ IP сервера

# Строки 19–21: раскомментировать и заполнить
proxy:
  ssl: true
  host: spaceforedu.com     # ← РЕАЛЬНЫЙ домен

# Строки 27–31: Docker registry (где будут храниться образы)
registry:
  server: ghcr.io           # или hub.docker.com
  username: your-gh-user    # ← ВАШ логин registry
  password:
    - KAMAL_REGISTRY_PASSWORD

# Строки 40–59: раскомментировать нужные переменные env.clear
env:
  secret:
    - RAILS_MASTER_KEY
    # - SENTRY_DSN_BACKEND   # раскомментировать, если используете Sentry
  clear:
    APP_HOST: spaceforedu.com                  # ← активирует SSL, SMTP, host protection
    APP_HOST_URL: https://spaceforedu.com      # ← для canonical / sitemap / structured data
    SOLID_QUEUE_IN_PUMA: true

    # Опционально:
    # GOOGLE_SITE_VERIFICATION: ""
    # YANDEX_VERIFICATION: ""
    # GTM_ID: GTM-XXXXXXX
    # SENTRY_DSN_FRONTEND: "https://xxx@oYYY.ingest.sentry.io/ZZZ"
    # SENTRY_ENVIRONMENT: production
    # SENTRY_TRACES_SAMPLE_RATE: "0.1"
```

> **Полный список env-переменных:** см. `.env.example` (single source of truth, с комментариями).

#### Шаг 2. Rails credentials (API-ключи, пароли)

```bash
EDITOR="nano" bin/rails credentials:edit
```

```yaml
# ── ОБЯЗАТЕЛЬНОЕ ──
stripe:
  secret_key: sk_live_...              # Stripe Dashboard → Developers → API keys
  webhook_secret: whsec_...            # добавить ПОСЛЕ деплоя (см. ниже)
  base_url: https://spaceforedu.com    # для return-URL в Checkout Session

google:
  client_id: ...apps.googleusercontent.com
  client_secret: GOCSPX-...

smtp:
  user_name: info@spaceforedu.com
  password: xxxx xxxx xxxx xxxx        # Gmail App Password (16 символов без пробелов тоже ок)
  address: smtp.gmail.com              # опционально — дефолт smtp.gmail.com
  port: 587                            # опционально — дефолт 587

# ── ОПЦИОНАЛЬНОЕ ──
facebook:
  app_id: ...
  app_secret: ...

telegram:
  bot_token: "123456:ABC..."
  bot_name: "SpaceForEduBot"
  webhook_secret: "любая-случайная-строка-32+-символа"

amo_crm:
  base_url: https://....amocrm.com
  client_id: ...
  client_secret: ...
  redirect_uri: https://spaceforedu.com/admin/integrations/amo_crm/callback
  homologation_pipeline_id: ...
  new_status_id: ...
  responsible_user_id: ...
  field_ids:
    email: ...
    phone: ...
    service_type: ...
```

> **Важно:** `VITE_STRIPE_CONSULTATION_LINK` — это **Payment Link** (начинается с `https://buy.stripe.com/`), **не** secret key. Он Vite-переменная (встраивается в JS-бандл), задаётся через `deploy.yml` → `env.clear` или пробрасывается в build args. Если оставить пустым, кнопка консультации фолбэкнется на WhatsApp.

#### Шаг 3. `.kamal/secrets` — только если используете Sentry backend

```bash
# Откройте редактором и раскомментируйте/добавьте строку:
# SENTRY_DSN_BACKEND=https://xxx@oYYY.ingest.sentry.io/ZZZ
```

> ⚠️ **НЕ используйте `echo ... > .kamal/secrets`** — это затрёт существующий `RAILS_MASTER_KEY=$(cat config/master.key)`. Редактируйте файл вручную или через `>>`.

#### Шаг 4. Registry-пароль (экспорт в shell)

```bash
# GitHub Container Registry:
export KAMAL_REGISTRY_PASSWORD=$(gh auth token)

# Docker Hub:
export KAMAL_REGISTRY_PASSWORD="ваш-docker-hub-token"
```

Чтобы не прописывать каждый раз — добавьте в `.zshrc` / `.bashrc` или используйте password manager.

---

### Первый деплой

```bash
# 1. Убедиться что Kamal установлен
bin/kamal version     # 2.x+

# 2. Registry password экспортирован (см. Шаг 4 выше)
echo $KAMAL_REGISTRY_PASSWORD | head -c 10     # проверка, что не пусто

# 3. Первый деплой (создаёт сервер, ставит Docker, пушит образ, запускает)
bin/kamal setup

# 4. Создать первого super_admin
bin/kamal console
```

```ruby
User.create!(
  name: "Admin Name",
  email_address: "admin@spaceforedu.com",
  password: "secure-password-16+-chars",
  password_confirmation: "secure-password-16+-chars",
  role: "super_admin"
)
```

### После деплоя: обязательные действия

#### 1. Stripe Webhook (5 минут)

1. Stripe Dashboard → Developers → **Webhooks** → **+ Add endpoint**
2. URL: `https://spaceforedu.com/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`
4. **Signing secret** (`whsec_...`) → добавить в credentials как `stripe.webhook_secret`:
   ```bash
   EDITOR="nano" bin/rails credentials:edit
   ```
5. Передеплой, чтобы подтянуть новые credentials:
   ```bash
   bin/kamal deploy
   ```
6. **Проверка:** Stripe Dashboard → Webhooks → Send test webhook → статус `200 OK`.

#### 2. Смоук-тест (10 минут)

- [ ] `https://spaceforedu.com` открывается, HTTPS валиден
- [ ] Регистрация нового пользователя работает
- [ ] Логин через Google OAuth
- [ ] Письмо после регистрации дошло (проверить также в спам-папке)
- [ ] Реальный платёж €1 через Payment Link консультации → редирект на thank-you → письмо о платеже
- [ ] Создание homologation-заявки из личного кабинета
- [ ] Оплата заявки через Stripe Checkout → webhook сработал → статус обновился в БД

#### 3. DNS-записи для email deliverability

Настройте у регистратора домена (зависит от SMTP-провайдера):
- **SPF** (TXT-запись на `@`): `v=spf1 include:_spf.google.com ~all` (для Gmail) / `include:spf.mtasv.net` (Postmark) / и т.д.
- **DKIM** (TXT-запись): провайдер даст точное значение и имя селектора.
- **DMARC** (TXT на `_dmarc`): `v=DMARC1; p=none; rua=mailto:info@spaceforedu.com`

Проверить корректность: [mail-tester.com](https://mail-tester.com) — отправьте письмо на их адрес, получите оценку.

#### 4. Бэкапы БД

```bash
# Ручной запуск бэкапа:
bin/kamal backup

# Для ежедневного автобэкапа — добавьте cron на сервере или в Solid Queue recurring jobs.
# Бэкапы лежат в volume — периодически копируйте их off-server (rsync / S3).
```

---

### Команды на каждый день

```bash
bin/kamal deploy        # задеплоить новую версию
bin/kamal logs          # логи в реальном времени (Ctrl+C для выхода)
bin/kamal console       # Rails console на сервере
bin/kamal dbc           # database console (SQLite)
bin/kamal shell         # bash внутри контейнера
bin/kamal app details   # статус контейнеров
bin/kamal backup        # запустить бэкап БД
```

### Откат к предыдущей версии

```bash
# Посмотреть доступные версии:
bin/kamal app versions

# Откатиться на конкретную версию (SHA первые 7 символов):
bin/kamal rollback <VERSION>
```

---

### Troubleshooting

| Симптом | Что проверить |
|---------|---------------|
| `kamal setup` висит на "Logging into registry" | `KAMAL_REGISTRY_PASSWORD` экспортирован? Правильный `username`? |
| `502 Bad Gateway` | `bin/kamal logs` → посмотреть стек-трейс Rails. Часто — не установлен `APP_HOST` или `RAILS_MASTER_KEY`. |
| SSL-сертификат не выпускается | DNS A-запись указывает на правильный IP? Порт 80 открыт у провайдера? |
| Email не уходит | SMTP credentials заполнены? Gmail App Password — не обычный пароль аккаунта. |
| Stripe webhook возвращает 400 | `stripe.webhook_secret` соответствует Signing secret из Dashboard? После изменения — передеплой. |
| OAuth "redirect_uri_mismatch" | В Google/Facebook console добавьте **точный** URI: `https://spaceforedu.com/auth/google_oauth2/callback` (без trailing slash). |
| Письма в спам | Настройте SPF / DKIM / DMARC (см. выше) — без них 80% писем попадают в спам. |
| Разные поведения `dev` vs `prod` | В dev читается `.env`, в prod — `deploy.yml` → `env.clear` + `.kamal/secrets`. Это разные источники. |

---

### Связанные документы

- `.env.example` — полный справочник всех env-переменных с комментариями
- `docs/20_SEO_ANALYTICS.md` — настройка GTM / GA4 / Яндекс.Метрика / Sentry
- `docs/12_SECURITY_GDPR.md` — соответствие GDPR, cookie consent
- `docs/06_AMOCRM_INTEGRATION.md` — подключение AmoCRM (опционально)
