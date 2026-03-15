# AmoCRM Integration

## Overview

Данные синхронизируются в AmoCRM **только после подтверждения оплаты координатором**.
Триггер: координатор нажимает "Confirm Payment" → фоновый джоб создаёт Contact + Lead в AmoCRM.

**Принцип:** студент заполняет всё что знает, система синхронизирует автоматически, координатор доделывает остальное вручную в AmoCRM.

## Trigger Flow

```
Student fills profile + request form → submits
    → coordinator reviews in our app
    → coordinator chats about payment
    → coordinator enters Sale amount + clicks "Confirm Payment"
        → status = "payment_confirmed"
        → AmoCrmSyncJob.perform_later(request.id)
            → 1. Find or create Contact with WhatsApp
            → 2. Create Lead in "Homologation" pipeline
            → 3. Upload Application + Originals files
            → 4. Save amo_crm_lead_id + amo_crm_contact_id
```

**No data goes to AmoCRM until payment is confirmed.** CRM stays clean.

## What Gets Synced vs Manual

### Auto-synced from our app (17 fields — saves 80% time)

| AmoCRM Field               | Source                  | Type         |
|----------------------------|-------------------------|--------------|
| **Contact: Name**          | `user.name`             | auto         |
| **Contact: Work email**    | `user.email_address`    | auto         |
| **Contact: Work phone**    | `user.phone`            | auto         |
| **Contact: WhatsApp**      | `user.whatsapp`         | auto (IM)    |
| **Contact: Birthday**      | `user.birthday`         | auto         |
| **Contact: Country**       | `user.country`          | auto         |
| **Contact: Age**           | calculated from birthday| auto         |
| **Contact: 18 years**      | calculated from birthday| auto         |
| **Contact: ID**            | `request.identity_card` | auto         |
| **Contact: Acceso**        | `request.referral_source`| auto        |
| **Contact: Language Knowledge** | `request.language_knowledge` | auto |
| **Contact: Language Certificate** | `request.language_certificate` | auto |
| **Contact: Subject**       | `request.study_type_spain` | auto      |
| **Lead: Services**         | `request.service_type`  | auto         |
| **Lead: Equivalencia**     | `service_type == "equivalencia"` | auto |
| **Lead: Sale**             | `request.payment_amount`| auto (coord enters in app) |
| **Lead: Date of receipt**  | `request.payment_confirmed_at` | auto |
| **Lead: Comment**          | `request.description`   | auto         |
| **Lead: Educational inst.**| `request.university`    | auto         |
| **Lead: Referral**         | `request.referral_source`| auto        |
| **Lead: Application**      | Active Storage file     | auto upload  |
| **Lead: Originals**        | Active Storage files    | auto upload  |

### Coordinator fills manually in AmoCRM (7 fields — 20%)

| AmoCRM Field            | Why manual                                    |
|-------------------------|-----------------------------------------------|
| **Lead: Expenses**      | Internal accounting, coordinator decides       |
| **Lead: Translations**  | Translator uploads after completing work       |
| **Lead: Registry**      | Generated during ministry registration process |
| **Lead: Reasons for refusal** | Only if rejected, filled later           |
| **Contact: Teachers**   | Assigned internally by coordinator             |
| **Contact: Comments**   | Internal notes                                 |
| **Lead: Responsible user** | Default "Center", coordinator reassigns if needed |

## WhatsApp in AmoCRM

WhatsApp is the key reason for CRM sync — enables direct messaging from AmoCRM.

```ruby
# WhatsApp as IM field in Contact
{
  field_id: WHATSAPP_FIELD_ID,
  values: [{
    value: user.whatsapp,    # e.g., "+34612345678"
    enum_code: "WHATSAPP"
  }]
}
```

Student provides WhatsApp at registration (required field). After sync, coordinator can message student directly from AmoCRM interface.

## Implementation

### Service: AmoCRM Client

```ruby
# app/services/amo_crm_client.rb
class AmoCrmClient
  BASE_URL = Rails.application.credentials.dig(:amo_crm, :base_url)

  def initialize
    @token = fetch_or_refresh_token
  end

  # ── Contact ──

  def find_or_create_contact(user)
    existing = get("/api/v4/contacts", query: user.email_address)
    if existing.dig("_embedded", "contacts")&.any?
      contact_id = existing["_embedded"]["contacts"][0]["id"]
      update_contact(contact_id, user)
      contact_id
    else
      create_contact(user)
    end
  end

  def create_contact(user)
    result = post("/api/v4/contacts", [{
      name: user.name,
      custom_fields_values: contact_fields(user)
    }])
    result.dig("_embedded", "contacts", 0, "id")
  end

  def update_contact(contact_id, user)
    patch("/api/v4/contacts/#{contact_id}", {
      name: user.name,
      custom_fields_values: contact_fields(user)
    })
  end

  # ── Lead ──

  def create_lead(request, contact_id)
    result = post("/api/v4/leads", [{
      name: "Homologation: #{request.subject}",
      pipeline_id: HOMOLOGATION_PIPELINE_ID,
      status_id: NEW_STATUS_ID,
      price: (request.payment_amount.to_f * 100).to_i,
      responsible_user_id: RESPONSIBLE_USER_ID,
      _embedded: {
        contacts: [{ id: contact_id }]
      },
      custom_fields_values: lead_fields(request)
    }])
    result.dig("_embedded", "leads", 0, "id")
  end

  def update_lead_status(lead_id, status_id)
    patch("/api/v4/leads/#{lead_id}", { status_id: status_id })
  end

  private

  def contact_fields(user)
    fields = [
      { field_code: "EMAIL", values: [{ value: user.email_address, enum_code: "WORK" }] },
      { field_code: "PHONE", values: [{ value: user.phone, enum_code: "WORK" }] },
    ]

    # WhatsApp — IM field for direct messaging
    fields << { field_id: field_ids[:whatsapp], values: [{ value: user.whatsapp, enum_code: "WHATSAPP" }] } if user.whatsapp.present?

    # Profile fields
    fields << custom_field(:country, user.country) if user.country.present?
    fields << custom_field(:birthday, user.birthday&.to_time&.to_i) if user.birthday.present?
    fields << custom_field(:eighteen_years, user.age.present? && user.age >= 18) if user.birthday.present?
    fields << custom_field(:age, user.age) if user.birthday.present?

    fields.compact
  end

  def lead_fields(request)
    fields = [
      custom_field(:services, request.service_type),
      custom_field(:equivalencia, request.service_type == "equivalencia"),
      custom_field(:date_of_receipt, request.payment_confirmed_at&.to_date&.to_time&.to_i),
      custom_field(:comment, request.description),
      custom_field(:educational_institution, request.university),
      custom_field(:subject, request.study_type_spain),
      custom_field(:identity_card, request.identity_card || request.passport),
      custom_field(:language_knowledge, request.language_knowledge),
      custom_field(:language_certificate, request.language_certificate),
    ]

    fields << custom_field(:referral, request.referral_source) if request.referral_source.present?
    fields << custom_field(:acceso, request.referral_source) if request.referral_source.present?

    fields.compact
  end

  def custom_field(key, value)
    return nil if value.nil?
    { field_id: field_ids[key], values: [{ value: value }] }
  end

  def field_ids
    @field_ids ||= Rails.application.credentials.dig(:amo_crm, :field_ids).symbolize_keys
  end

  # ── HTTP (Faraday) ──

  def connection
    @connection ||= Faraday.new(url: BASE_URL) do |f|
      f.request :json
      f.response :json
      f.request :retry, max: 3, interval: 1, backoff_factor: 2,
                        retry_statuses: [429, 500, 502, 503]
      f.adapter Faraday.default_adapter
    end
  end

  def get(path, params = {})
    response = connection.get(path, params) do |req|
      req.headers["Authorization"] = "Bearer #{@token}"
    end
    handle_response(response)
  end

  def post(path, body)
    response = connection.post(path) do |req|
      req.headers["Authorization"] = "Bearer #{@token}"
      req.body = body
    end
    handle_response(response)
  end

  def patch(path, body)
    response = connection.patch(path) do |req|
      req.headers["Authorization"] = "Bearer #{@token}"
      req.body = body
    end
    handle_response(response)
  end

  def handle_response(response)
    unless response.success?
      raise "AmoCRM API error: #{response.status} — #{response.body}"
    end
    response.body
  end

  def fetch_or_refresh_token
    token_data = AmoCrmToken.current
    if token_data.expired?
      refreshed = refresh_token(token_data.refresh_token)
      token_data.update!(
        access_token: refreshed["access_token"],
        refresh_token: refreshed["refresh_token"],
        expires_at: Time.current + refreshed["expires_in"].seconds
      )
    end
    token_data.access_token
  end

  def refresh_token(refresh_token)
    conn = Faraday.new(url: BASE_URL) do |f|
      f.request :json
      f.response :json
    end
    response = conn.post("/oauth2/access_token", {
      client_id: Rails.application.credentials.dig(:amo_crm, :client_id),
      client_secret: Rails.application.credentials.dig(:amo_crm, :client_secret),
      grant_type: "refresh_token",
      refresh_token: refresh_token,
      redirect_uri: Rails.application.credentials.dig(:amo_crm, :redirect_uri)
    })
    response.body
  end

  HOMOLOGATION_PIPELINE_ID = Rails.application.credentials.dig(:amo_crm, :homologation_pipeline_id)
  NEW_STATUS_ID = Rails.application.credentials.dig(:amo_crm, :new_status_id)
  RESPONSIBLE_USER_ID = Rails.application.credentials.dig(:amo_crm, :responsible_user_id)
end
```

### Background Job

```ruby
# app/jobs/amo_crm_sync_job.rb
class AmoCrmSyncJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(homologation_request_id)
    request = HomologationRequest.find(homologation_request_id)
    user = request.user
    client = AmoCrmClient.new

    # Step 1: Find or create Contact with WhatsApp
    contact_id = client.find_or_create_contact(user)
    user.update!(amo_crm_contact_id: contact_id.to_s)

    # Step 2: Create Lead in Homologation pipeline
    lead_id = client.create_lead(request, contact_id)
    request.update!(
      amo_crm_lead_id: lead_id.to_s,
      amo_crm_synced_at: Time.current,
      amo_crm_sync_error: nil
    )

    # Step 3: Upload student files to Lead
    upload_files_to_lead(client, request, lead_id)

    Rails.logger.info("AmoCRM sync OK: Lead ##{lead_id} for Request ##{request.id}")
  rescue => e
    request&.update(amo_crm_sync_error: e.message)
    raise
  end

  private

  def upload_files_to_lead(client, request, lead_id)
    # Upload Application file
    if request.application.attached?
      # AmoCRM file upload via /api/v4/leads/{id}/files
    end

    # Upload Originals files
    request.originals.each do |original|
      # Upload each original document
    end
  end
end
```

### Controller: Confirm Payment

```ruby
# app/controllers/homologation_requests_controller.rb
class HomologationRequestsController < InertiaController
  def confirm_payment
    @request = HomologationRequest.find(params[:id])
    authorize @request, :confirm_payment?

    ActiveRecord::Base.transaction do
      @request.update!(
        payment_amount: params[:payment_amount],
        payment_confirmed_by: current_user.id
      )
      # Use transition_to! — never update!(status: ...) directly.
      # This enforces the state machine and sets status_changed_at/by.
      @request.transition_to!("payment_confirmed", changed_by: current_user)
    end

    AmoCrmSyncJob.perform_later(@request.id)

    NotificationJob.perform_later(
      user_id: @request.user_id,
      title: I18n.t("notifications.payment_confirmed"),
      body: I18n.t("notifications.payment_confirmed_body",
                    amount: @request.payment_amount, subject: @request.subject),
      notifiable: @request
    )

    redirect_to homologation_request_path(@request),
      notice: t("flash.payment_confirmed")
  end
end
```

### Frontend: Confirm Payment Dialog

```tsx
// In requests/Show.tsx — coordinator sees this when status == "awaiting_payment"
function ConfirmPaymentDialog({ requestId }: { requestId: number }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = () => {
    setSubmitting(true)
    router.post(routes.confirmPayment(requestId), {
      payment_amount: amount
    }, {
      onFinish: () => { setSubmitting(false); setOpen(false) }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600">Confirm Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Payment Received</DialogTitle>
          <DialogDescription>
            Enter the payment amount. This will sync the request to AmoCRM.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Amount (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="60.00"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!amount || submitting}>
            {submitting ? "Syncing..." : "Confirm & Sync to CRM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Credentials Configuration

```bash
bin/rails credentials:edit
```

```yaml
amo_crm:
  base_url: "https://yourdomain.amocrm.com"
  client_id: "your-integration-id"
  client_secret: "your-integration-secret"
  redirect_uri: "https://yourapp.com/amo_crm/callback"

  # IDs from AmoCRM admin (Settings → API)
  homologation_pipeline_id: 12345
  new_status_id: 67890
  responsible_user_id: 11111

  # Custom field IDs
  # Get via: GET /api/v4/leads/custom_fields and /api/v4/contacts/custom_fields
  field_ids:
    # Lead custom fields
    services: 123001
    equivalencia: 123002
    date_of_receipt: 123003
    comment: 123004
    educational_institution: 123005
    referral: 123006
    identity_card: 123007
    language_knowledge: 123008
    language_certificate: 123009
    subject: 123010
    # Contact custom fields
    whatsapp: 124001
    country: 124002
    birthday: 124003
    eighteen_years: 124004
    age: 124005
    acceso: 124006
```

## Token Management

```ruby
# app/models/amo_crm_token.rb
class AmoCrmToken < ApplicationRecord
  def self.current
    last || raise("No AmoCRM token configured. Complete initial OAuth setup.")
  end

  def expired?
    expires_at < 5.minutes.from_now
  end
end
```

Initial setup: one-time OAuth flow in browser to get first token pair.

## Initial Setup Guide

1. **Create integration in AmoCRM** → Settings → Integrations → Add → External Integration
2. **Get pipeline + status IDs**: `GET /api/v4/leads/pipelines` → find "Homologation" pipeline → note `pipeline_id` and `status_id` for "New"
3. **Get custom field IDs**:
   - Lead fields: `GET /api/v4/leads/custom_fields` → note IDs for services, equivalencia, date_of_receipt, etc.
   - Contact fields: `GET /api/v4/contacts/custom_fields` → note IDs for whatsapp, country, birthday, etc.
4. **Get responsible_user_id**: `GET /api/v4/users` → find default responsible user
5. **Add all IDs to Rails credentials**: `bin/rails credentials:edit` → paste into `amo_crm:` section (see config below)
6. **Complete OAuth flow**: Visit `{base_url}/oauth2/authorize?client_id={id}&redirect_uri={uri}&response_type=code` → authorize → exchange code for token pair → insert into `amo_crm_tokens` table

## Admin: Sync Status Panel

In admin dashboard and request detail page:
- Sync status badge: "Synced" (green) / "Syncing..." (yellow) / "Error" (red) / "Not synced" (gray)
- `amo_crm_synced_at` — last successful sync time
- `amo_crm_sync_error` — error message if failed
- "Retry Sync" button on error
- Direct link to Lead in AmoCRM: `{base_url}/leads/detail/{amo_crm_lead_id}`

## Status Mapping (App → AmoCRM Pipeline Stages)

| App Status            | AmoCRM Stage     | Notes                              |
|-----------------------|------------------|------------------------------------|
| payment_confirmed     | New              | Lead created at this moment        |
| in_progress           | In Progress      | Work started                       |
| resolved              | Won/Completed    | Homologation approved              |
| closed                | Lost             | Rejected or cancelled              |

**Only post-payment statuses sync to AmoCRM.** Pre-payment statuses (submitted, in_review, awaiting_payment) exist only in our app.
