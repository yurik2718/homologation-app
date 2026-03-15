# Security & GDPR (Simplified)

## EU Compliance — Minimum Required

### 1. Privacy Policy
Static page at `/privacy-policy`. Describes:
- What data we collect and why
- Transfer to AmoCRM (third party)
- Contact email for deletion requests

### 2. Consent
- Checkbox "I accept the privacy policy" on registration + request form
- `users.privacy_accepted_at` — timestamp saved in DB

### 3. Right to Erasure
- Link "Contact us to delete your account" on profile page → opens email
- Admin handles deletion manually when requested
- No self-service portal for MVP

### 4. Data at Rest Encryption

```ruby
# app/models/user.rb
class User < ApplicationRecord
  encrypts :phone
  encrypts :whatsapp
  encrypts :guardian_phone
  encrypts :guardian_whatsapp
end

# app/models/homologation_request.rb
# identity_card and passport live on homologation_requests (per-request data, not profile data)
class HomologationRequest < ApplicationRecord
  encrypts :identity_card
  encrypts :passport
end
```

Setup: `bin/rails db:encryption:init` (adds keys to credentials).

### 5. Filter PII from Logs

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :password, :token, :secret,
  :email, :phone, :whatsapp,
  :identity_card, :passport, :birthday
]
```

## Application Security

### Rate Limiting (Rails 8 built-in)

```ruby
# app/controllers/auth/sessions_controller.rb
rate_limit to: 10, within: 3.minutes, only: :create,
  with: -> { redirect_to new_session_path, alert: t("auth.too_many_attempts") }

# app/controllers/auth/registrations_controller.rb
rate_limit to: 5, within: 1.hour, only: :create,
  with: -> { redirect_to new_registration_path, alert: t("auth.too_many_attempts") }
```

### Everything Else — Already Built Into Rails 8

- CSRF protection — enabled by default
- XSS — React escapes output, no `dangerouslySetInnerHTML` (we use textarea, not rich text)
- SQL injection — ActiveRecord parameterizes all queries
- HTTPS — `config.force_ssl = true` (default in production)
- Encrypted sessions — AES-256-GCM cookies (default)
- Secure headers — HSTS, HttpOnly, SameSite=Lax (default)
- File validation — `active_storage_validations` gem
- Authorization — Pundit on every controller
- Credentials — `bin/rails credentials:edit` (encrypted, in git)
- Security scanning — `brakeman` + `bundler-audit` (already in Gemfile)

### File Access Control

```ruby
# Files served through controller, not direct URLs
# config/environments/production.rb
config.active_storage.resolve_model_to_route = :rails_storage_proxy
```

Pundit policy checks access before serving any file.

## Checklist Before Launch

- [ ] `force_ssl = true`
- [ ] `encrypts` on PII fields
- [ ] `rate_limit` on auth controllers
- [ ] Privacy policy page exists
- [ ] Privacy checkbox on registration + request forms
- [ ] PII filtered from logs
- [ ] `brakeman` passes
- [ ] `bundler-audit` passes
- [ ] Files served via proxy (not direct S3/disk URLs)
- [ ] DPA requested from AmoCRM (email support@amocrm.com)
