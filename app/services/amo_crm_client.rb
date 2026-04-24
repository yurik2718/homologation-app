class AmoCrmClient
  class ApiError < StandardError; end

  BASE_URL = Rails.application.credentials.dig(:amo_crm, :base_url) || "https://example.amocrm.com"

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
    result = post("/api/v4/contacts", [ { name: user.name, custom_fields_values: contact_fields(user) } ])
    result.dig("_embedded", "contacts", 0, "id")
  end

  def update_contact(contact_id, user)
    patch("/api/v4/contacts/#{contact_id}", { name: user.name, custom_fields_values: contact_fields(user) })
  end

  # ── Lead ──

  def create_lead(request, contact_id)
    result = post("/api/v4/leads", [ {
      name: "Homologation: #{request.subject}",
      pipeline_id: pipeline_id,
      status_id: new_status_id,
      price: (request.payment_amount.to_f * 100).to_i,
      responsible_user_id: responsible_user_id,
      _embedded: { contacts: [ { id: contact_id } ] },
      custom_fields_values: lead_fields(request)
    } ])
    result.dig("_embedded", "leads", 0, "id")
  end

  def update_lead_status(lead_id, status_id)
    patch("/api/v4/leads/#{lead_id}", { status_id: status_id })
  end

  private

  def contact_fields(user)
    fields = [
      { field_code: "EMAIL", values: [ { value: user.email_address, enum_code: "WORK" } ] },
      { field_code: "PHONE", values: [ { value: user.phone, enum_code: "WORK" } ] }
    ]

    fields << { field_id: field_ids[:whatsapp], values: [ { value: user.whatsapp, enum_code: "WHATSAPP" } ] } if user.whatsapp.present?
    fields << custom_field(:country, user.country) if user.country.present?
    if user.birthday.present?
      fields << custom_field(:birthday, user.birthday.to_time.to_i)
      age = user.age
      fields << custom_field(:eighteen_years, age >= 18)
      fields << custom_field(:age, age)
    end

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
      custom_field(:language_certificate, request.language_certificate)
    ]

    fields.compact
  end

  def custom_field(key, value)
    return nil if value.nil?
    fid = field_ids[key]
    return nil unless fid
    { field_id: fid, values: [ { value: value } ] }
  end

  def field_ids
    @field_ids ||= (Rails.application.credentials.dig(:amo_crm, :field_ids) || {}).symbolize_keys
  end

  def pipeline_id
    Rails.application.credentials.dig(:amo_crm, :homologation_pipeline_id) || 0
  end

  def new_status_id
    Rails.application.credentials.dig(:amo_crm, :new_status_id) || 0
  end

  def responsible_user_id
    Rails.application.credentials.dig(:amo_crm, :responsible_user_id) || 0
  end

  # ── HTTP (Faraday) ──

  def connection
    @connection ||= Faraday.new(url: BASE_URL) do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
    end
  end

  def get(path, params = {})
    response = connection.get(path, params) { |req| authorize_request(req) }
    handle_response(response)
  end

  def post(path, body)
    response = connection.post(path) { |req| authorize_request(req); req.body = body }
    handle_response(response)
  end

  def patch(path, body)
    response = connection.patch(path) { |req| authorize_request(req); req.body = body }
    handle_response(response)
  end

  def authorize_request(req)
    req.headers["Authorization"] = "Bearer #{@token}"
  end

  def handle_response(response)
    unless response.success?
      raise ApiError, "AmoCRM API error: #{response.status} — #{response.body}"
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

  def refresh_token(current_refresh_token)
    response = connection.post("/oauth2/access_token", {
      client_id: Rails.application.credentials.dig(:amo_crm, :client_id),
      client_secret: Rails.application.credentials.dig(:amo_crm, :client_secret),
      grant_type: "refresh_token",
      refresh_token: current_refresh_token,
      redirect_uri: Rails.application.credentials.dig(:amo_crm, :redirect_uri)
    })
    handle_response(response)
  end
end
