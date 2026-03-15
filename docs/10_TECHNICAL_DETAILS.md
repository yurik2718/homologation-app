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

education_systems:
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
