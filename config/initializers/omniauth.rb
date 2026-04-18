OmniAuth.config.allowed_request_methods = [ :post ]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    ENV["GOOGLE_CLIENT_ID"] || Rails.application.credentials.dig(:google, :client_id) || "placeholder",
    ENV["GOOGLE_CLIENT_SECRET"] || Rails.application.credentials.dig(:google, :client_secret) || "placeholder",
    { scope: "email,profile", prompt: "select_account" }

  provider :facebook,
    ENV["FACEBOOK_APP_ID"] || Rails.application.credentials.dig(:facebook, :app_id) || "placeholder",
    ENV["FACEBOOK_APP_SECRET"] || Rails.application.credentials.dig(:facebook, :app_secret) || "placeholder",
    { scope: "email,public_profile", info_fields: "email,name" }
end
