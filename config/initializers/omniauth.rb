OmniAuth.config.allowed_request_methods = [ :post ]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    Rails.application.credentials.dig(:google, :client_id) || "placeholder",
    Rails.application.credentials.dig(:google, :client_secret) || "placeholder",
    { scope: "email,profile", prompt: "select_account" }

  if (apple_client_id = Rails.application.credentials.dig(:apple, :client_id))
    provider :apple,
      apple_client_id, "",
      {
        scope: "email name",
        team_id: Rails.application.credentials.dig(:apple, :team_id),
        key_id:  Rails.application.credentials.dig(:apple, :key_id),
        pem:     Rails.application.credentials.dig(:apple, :pem)
      }
  end
end
