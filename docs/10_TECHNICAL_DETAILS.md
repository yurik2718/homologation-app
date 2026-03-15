# Technical Details

## 1. Select Options

All dropdown options in one YAML file. Frontend reads them via Inertia shared data.

```yaml
# config/select_options.yml
service_types:
  - key: "equivalencia"
    label_es: "Equivalencia"
    label_en: "Equivalence"
    label_ru: "Эквивалентность"
  - key: "invoice"
    label_es: "Solicitud de factura"
    label_en: "Invoice Request"
    label_ru: "Запрос счёта"
  - key: "informe"
    label_es: "Informe técnico"
    label_en: "Technical Report"
    label_ru: "Технический отчёт"
  - key: "other"
    label_es: "Otro"
    label_en: "Other"
    label_ru: "Другое"

education_systems:  # Country whose education system the student studied in (NOT country of origin — that's `countries`)
  - { key: "argentina", label: "Argentina" }
  - { key: "colombia", label: "Colombia" }
  - { key: "mexico", label: "México" }
  - { key: "peru", label: "Perú" }
  - { key: "venezuela", label: "Venezuela" }
  - { key: "russia", label: "Rusia" }
  - { key: "ukraine", label: "Ucrania" }
  - { key: "other", label: "Otro" }
  # ... extend as needed

studies_finished:
  - { key: "yes", label_es: "Sí", label_en: "Yes", label_ru: "Да" }
  - { key: "no", label_es: "No", label_en: "No", label_ru: "Нет" }
  - { key: "in_progress", label_es: "En curso", label_en: "In Progress", label_ru: "В процессе" }

study_types_spain:
  - { key: "bachillerato", label: "Bachillerato" }
  - { key: "fp_medio", label: "FP Grado Medio" }
  - { key: "fp_superior", label: "FP Grado Superior" }
  - { key: "grado", label: "Grado Universitario" }
  - { key: "master", label: "Máster" }
  - { key: "doctorado", label: "Doctorado" }

universities:
  - { key: "ucm", label: "Universidad Complutense de Madrid" }
  - { key: "uam", label: "Universidad Autónoma de Madrid" }
  - { key: "ceu", label: "CEU San Pablo" }
  - { key: "ue", label: "Universidad Europea" }
  - { key: "other", label: "Otra" }
  # ... extend as needed

language_levels:
  - { key: "a1", label: "A1" }
  - { key: "a2", label: "A2" }
  - { key: "b1", label: "B1" }
  - { key: "b2", label: "B2" }
  - { key: "c1", label: "C1" }
  - { key: "c2", label: "C2" }
  - { key: "none", label_es: "Sin certificado", label_en: "None", label_ru: "Нет" }

language_certificates:
  - { key: "dele", label: "DELE" }
  - { key: "siele", label: "SIELE" }
  - { key: "other", label_es: "Otro", label_en: "Other", label_ru: "Другой" }
  - { key: "none", label_es: "Ninguno", label_en: "None", label_ru: "Нет" }

referral_sources:
  - { key: "google", label: "Google" }
  - { key: "instagram", label: "Instagram" }
  - { key: "facebook", label: "Facebook" }
  - { key: "friend", label_es: "Amigo", label_en: "Friend", label_ru: "Друг" }
  - { key: "university", label_es: "Universidad", label_en: "University", label_ru: "Университет" }
  - { key: "other", label_es: "Otro", label_en: "Other", label_ru: "Другое" }

countries:
  - { key: "AR", label: "Argentina" }
  - { key: "CO", label: "Colombia" }
  - { key: "MX", label: "México" }
  - { key: "PE", label: "Perú" }
  - { key: "VE", label: "Venezuela" }
  - { key: "RU", label: "Rusia" }
  - { key: "UA", label: "Ucrania" }
  - { key: "US", label: "Estados Unidos" }
  # ... extend as needed

# AmoCRM enum IDs (filled after reading AmoCRM API)
amo_crm_enums:
  services:
    equivalencia: 0  # Replace with real AmoCRM enum ID
    invoice: 0
    informe: 0
  # ... fill after: GET /api/v4/leads/custom_fields
```

### Passing to Frontend

```ruby
# config/initializers/inertia_rails.rb — in shared_data lambda:
select_options: YAML.load_file(Rails.root.join("config/select_options.yml"))
```

```tsx
// Frontend: reading options
const { select_options } = usePage().props
const locale = i18n.language // "es" | "en" | "ru"
const label = (opt) => opt[`label_${locale}`] || opt.label || opt.key
```

---

## 2. AmoCRM API (Faraday)

Simplified client. See `docs/06_AMOCRM_INTEGRATION.md` for full field mapping.

Key points:
- `gem "faraday"` + `gem "faraday-multipart"` for file uploads
- Auto-retry on 429 (rate limit) built into Faraday
- Token refresh via `amo_crm_tokens` table
- Triggered ONLY on "Confirm Payment" button click
- Background job (`AmoCrmSyncJob`) — non-blocking

---

## 3. Active Storage (Files)

- **Direct Upload** from browser → storage (bypasses Rails server)
- `@rails/activestorage` npm package + `react-dropzone` for UI
- Validation via `active_storage_validations` gem: content_type + size (10MB max)
- 3 attachment types: `:application` (one), `:originals` (many), `:documents` (many)
- Coordinator downloads via controller with Pundit authorization check

---

## 4. Action Cable (Chat)

- **Send** messages via HTTP POST (Inertia `router.post`) — handles CSRF, file attachments
- **Receive** messages via WebSocket (Action Cable) — true real-time
- `@rails/actioncable` npm package
- React hook `useChannel(channelName, params, onReceived)`
- Auth: same session cookie as HTTP (no extra config)
- Solid Cable adapter (SQLite-backed, already configured, no Redis)
- Auto-reconnect built into Action Cable client

---

## 5. Telegram Bot Notifications (Free)

Telegram Bot API — completely free, no limits, no message templates, no provider needed.

### Setup

1. Create bot via [@BotFather](https://t.me/BotFather) → get `bot_token`
2. Add token to Rails credentials: `bin/rails credentials:edit`
   ```yaml
   telegram:
     bot_token: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
     webhook_secret: "random_secret_string_for_verification"
   ```
3. Set webhook (one-time, in production):
   ```bash
   curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
     -d "url=https://yourapp.com/telegram/webhook&secret_token=random_secret_string"
   ```

### Service: TelegramClient

```ruby
# app/services/telegram_client.rb
class TelegramClient
  API_BASE = "https://api.telegram.org/bot#{Rails.application.credentials.dig(:telegram, :bot_token)}"

  def initialize
    @conn = Faraday.new(url: API_BASE) do |f|
      f.request :json
      f.response :json
      f.request :retry, max: 2, interval: 1
    end
  end

  def send_message(chat_id, text)
    @conn.post("/sendMessage", {
      chat_id: chat_id,
      text: text,
      parse_mode: "HTML"
    })
  end
end
```

### Webhook Controller

```ruby
# app/controllers/telegram_controller.rb
class TelegramController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_after_action :verify_authorized

  def webhook
    # Verify webhook secret
    unless request.headers["X-Telegram-Bot-Api-Secret-Token"] == Rails.application.credentials.dig(:telegram, :webhook_secret)
      return head :forbidden
    end

    data = JSON.parse(request.body.read)
    handle_message(data["message"]) if data["message"]
    head :ok
  end

  private

  def handle_message(message)
    text = message["text"]
    chat_id = message["chat"]["id"]

    if text&.start_with?("/start")
      # /start USER_TOKEN — link Telegram to user account
      user_token = text.split(" ")[1]
      user = User.find_by(telegram_link_token: user_token)
      if user
        user.update!(telegram_chat_id: chat_id.to_s, notification_telegram: true, telegram_link_token: nil)
        TelegramClient.new.send_message(chat_id, "✅ Telegram connected! You will receive notifications here.")
      else
        TelegramClient.new.send_message(chat_id, "❌ Invalid link. Please use the button in your profile.")
      end
    end
  end
end
```

### "Connect Telegram" flow

1. **Profile page:** User clicks "Connect Telegram" button
2. **Backend:** Generates one-time `telegram_link_token` (SecureRandom.hex), saves to user
3. **Frontend:** Opens `https://t.me/YourBotName?start={telegram_link_token}` in new tab
4. **Telegram:** User sees bot, clicks "Start"
5. **Webhook:** Bot receives `/start {token}`, matches user, saves `chat_id`
6. **Profile page:** Shows "Telegram connected ✅" (poll or refresh)

### Route

```ruby
post "/telegram/webhook", to: "telegram#webhook"
```

### User model fields

```ruby
# Add to users table:
# telegram_chat_id      :string   — Telegram chat ID (set by bot webhook)
# telegram_link_token   :string   — One-time token for linking (generated when user clicks "Connect")
# notification_telegram :boolean  — default: false
# notification_email    :boolean  — default: true
```

### Message formatting (HTML)

```ruby
# In NotificationJob:
def telegram_text(notification)
  "<b>#{notification.title}</b>\n#{notification.body}"
end
```

Telegram supports basic HTML: `<b>`, `<i>`, `<a href="">`, `<code>`, `<pre>`. No Markdown conflicts.
