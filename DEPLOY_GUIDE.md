# Подготовка к запуску / Pre-Deploy Guide

---

## Часть 1. Для заказчика

Чтобы запустить сайт, мне нужны от вас следующие данные.
Заполните таблицу и отправьте разработчику.

### Обязательное

| # | Что нужно | Пример | Где взять | Готово? |
|---|-----------|--------|-----------|---------|
| 1 | Домен `spaceforedu.com` | Уже куплен | См. инструкцию «Миграция домена» ниже | ☐ |
| 3 | Номер WhatsApp (с кодом страны) | `34663689393` | Ваш телефон | ☐ |
| 4 | Email для контактов на сайте | `info@spaceforedu.com` | Ваша почта | ☐ |
| 5 | Email для поддержки клиентов | `support@spaceforedu.com` | Ваша почта | ☐ |
| 6 | Telegram (без @) | `spaceforedu` | Ваш профиль | ☐ |
| 7 | Stripe-аккаунт | — | См. инструкцию ниже | ☐ |
| 8 | Google OAuth ключи | — | См. инструкцию ниже | ☐ |
| 9 | SMTP для отправки email | — | Gmail App Password или Postmark | ☐ |

### Опционально (можно добавить позже)

| # | Что нужно | Зачем |
|---|-----------|-------|
| 10 | Facebook App (бесплатно) | Кнопка "Войти через Facebook" — см. инструкцию ниже |
| 11 | Telegram Bot | Уведомления клиентам в Telegram |
| 12 | AmoCRM интеграция | Синхронизация заявок с CRM |
| 13 | Фото команды | Для страницы с тарифами |
| 14 | Реальные отзывы клиентов (3 шт.) | Для страницы с тарифами |
| 15 | Логотипы университетов-партнёров | Для блока доверия на странице тарифов |

---

### Инструкция: Миграция домена spaceforedu.com (15–30 минут)

Домен уже куплен и используется для старого приложения. Есть 3 варианта перехода:

**Вариант А — Мгновенная замена (если старое приложение больше не нужно)**

1. Заведите новый VPS-сервер и задеплойте новое приложение (см. Часть 2)
2. Убедитесь, что новое приложение работает по IP-адресу сервера
3. Зайдите в панель управления DNS вашего регистратора (Namecheap, GoDaddy и т.д.)
4. Измените A-запись `spaceforedu.com` → IP нового сервера
5. Подождите 5–30 минут (обновление DNS)
6. Готово — `spaceforedu.com` теперь ведёт на новое приложение

**Вариант Б — Плавный переход (старое приложение остаётся на поддомене)**

1. Задеплойте новое приложение на новый сервер
2. В DNS создайте поддомен для старого приложения:
   - `old.spaceforedu.com` → A-запись → IP **старого** сервера
3. Перенастройте старое приложение на `old.spaceforedu.com`
4. Измените основную A-запись `spaceforedu.com` → IP **нового** сервера
5. Итог: `spaceforedu.com` = новое приложение, `old.spaceforedu.com` = старое

**Вариант В — Новое приложение на поддомене (тестирование перед переходом)**

1. Задеплойте новое приложение на новый сервер
2. В DNS создайте поддомен: `app.spaceforedu.com` → A-запись → IP нового сервера
3. Тестируйте на `app.spaceforedu.com`
4. Когда всё готово — поменяйте A-записи местами (Вариант А или Б)

> **Совет:** Вариант В самый безопасный — старое приложение продолжает работать,
> а вы спокойно тестируете новое. Когда всё проверено — переключаете за 5 минут.

---

### Инструкция: Stripe (10–15 минут)

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. Пройдите верификацию бизнеса (имя, адрес, банковский счёт) — **может занять 1–3 дня**
3. Создайте Payment Link для консультации:
   - Stripe Dashboard → **Payment Links** → **+ New**
   - Продукт: "Expert Consultation", цена **100 €**, разовый платёж
   - **After payment** → Redirect → `https://ваш-домен.com/es/consultation-thank-you`
   - Включите сбор email и телефона
4. Отправьте разработчику:
   - Payment Link URL (начинается с `https://buy.stripe.com/...`)
   - Secret key (Dashboard → Developers → API keys)
5. Включите автоматические чеки: **Settings** → **Emails** → **Successful payments**

### Инструкция: Google OAuth (10 минут)

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте проект → **APIs & Services** → **Credentials** → **Create OAuth Client ID**
3. Тип: **Web application**
4. Redirect URI: `https://ваш-домен.com/auth/google_oauth2/callback`
5. Отправьте разработчику: **Client ID** и **Client Secret**

### Инструкция: Facebook OAuth — опционально (10 минут, бесплатно)

1. Откройте [developers.facebook.com](https://developers.facebook.com) и войдите
2. **My Apps** → **Create App** → тип **Consumer**
3. Добавьте продукт **Facebook Login** → **Web**
4. Site URL: `https://ваш-домен.com`
5. **Facebook Login** → **Settings** → Valid OAuth Redirect URIs:
   `https://ваш-домен.com/auth/facebook/callback`
6. **Settings** → **Basic** → скопируйте **App ID** и **App Secret**
7. Отправьте разработчику: **App ID** и **App Secret**

> Приложение будет в режиме Development (работает только для администраторов).
> Чтобы все пользователи могли входить — нажмите **Go Live** в верхней панели.

### Инструкция: Email (SMTP)

**Вариант Gmail (бесплатно):**
1. Откройте [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Создайте App Password для "Mail"
3. Отправьте разработчику: ваш Gmail и сгенерированный пароль

**Вариант Postmark/Mailgun (для бизнеса):**
Отправьте разработчику SMTP-адрес, логин и пароль от провайдера.

---

## Часть 2. Для разработчика

### Файлы, которые нужно обновить перед деплоем

Всего **3 файла**. Остальные конфиги (database.yml, cable.yml, storage.yml и т.д.) уже настроены и не требуют изменений.

#### 1. `.env` — контакты и Stripe ссылка
```bash
cp .env.example .env && nano .env
```
```env
VITE_CONTACT_WHATSAPP=34663689393        # ← реальный номер
VITE_CONTACT_EMAIL=info@spaceforedu.com  # ← реальный email
VITE_SUPPORT_EMAIL=support@spaceforedu.com
VITE_CONTACT_TELEGRAM=spaceforedu        # ← реальный username
VITE_STRIPE_CONSULTATION_LINK=https://buy.stripe.com/xxx  # ← из Stripe Dashboard
```

#### 2. `config/deploy.yml` — сервер и домен
```yaml
servers:
  web:
    - 123.45.67.89              # ← реальный IP сервера

proxy:
  ssl: true
  host: spaceforedu.com         # ← ваш домен

env:
  clear:
    APP_HOST: spaceforedu.com   # ← тот же домен (активирует SSL, SMTP, host protection)
```

#### 3. `config/credentials.yml.enc` — секреты (API-ключи, пароли)
```bash
EDITOR="nano" bin/rails credentials:edit
```
```yaml
# ── Обязательное ──
stripe:
  secret_key: sk_live_...         # Stripe Dashboard → Developers → API keys
  webhook_secret: whsec_...       # Stripe Dashboard → Webhooks → Signing secret
  base_url: https://spaceforedu.com

google:
  client_id: ...apps.googleusercontent.com   # Google Cloud Console → Credentials
  client_secret: GOCSPX-...

smtp:
  user_name: info@spaceforedu.com  # Gmail или ваш SMTP-провайдер
  password: xxxx xxxx xxxx xxxx    # Gmail → App Password
  address: smtp.gmail.com
  port: 587

# ── Опционально ──
facebook:
  app_id: ...                      # developers.facebook.com → App Settings
  app_secret: ...

telegram:
  bot_token: "123456:ABC..."       # @BotFather в Telegram
  bot_name: "SpaceForEduBot"
  webhook_secret: "любая-случайная-строка"

amo_crm:
  base_url: https://....amocrm.com
  client_id: ...
  client_secret: ...
  redirect_uri: ...
  homologation_pipeline_id: ...
  new_status_id: ...
  responsible_user_id: ...
  field_ids:
    email: ...
    phone: ...
    service_type: ...
```

> **Всё остальное трогать не нужно.** Файлы `database.yml`, `cable.yml`, `queue.yml`,
> `cache.yml`, `storage.yml`, `puma.rb`, `select_options/*.yml` — уже настроены правильно.

---

### Что уже настроено

- **Dockerfile** — production-ready, multi-stage build, Node.js + Vite + Rails
- **Kamal** — `config/deploy.yml` готов, нужно только заполнить IP и домен
- **production.rb** — env-driven: SSL, SMTP, host protection активируются через `APP_HOST`
- **bin/setup** — автоматически копирует `.env.example` → `.env`
- **SQLite** — не нужен внешний PostgreSQL/MySQL. Всё в одном файле, volume в Docker

### Деплой

```bash
# 1. Заполнить 3 файла выше (.env, deploy.yml, credentials)

# 2. Добавить RAILS_MASTER_KEY в .kamal/secrets
echo "RAILS_MASTER_KEY=$(cat config/master.key)" > .kamal/secrets

# 3. Первый деплой
kamal setup

# 4. Создать super_admin
kamal console
# → User.create!(name: "...", email_address: "...", password: "...", password_confirmation: "...", role: "super_admin")

# Все последующие деплои:
kamal deploy
```

### Полезные команды

```bash
kamal console       # Rails console на сервере
kamal logs          # Логи в реальном времени
kamal shell         # SSH в контейнер
kamal deploy        # Деплой новой версии
```

### После деплоя: Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
2. URL: `https://yourdomain.com/webhooks/stripe`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Скопировать Signing secret → добавить в credentials как `stripe.webhook_secret`
