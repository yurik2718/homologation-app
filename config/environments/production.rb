require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false

  # Turn on fragment caching in view templates.
  config.action_controller.perform_caching = true

  # Cache assets for far-future expiry since they are all digest stamped.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # ─── SSL ────────────────────────────────────────────────────────────────────
  # Activated when APP_HOST is set (i.e. you have a real domain).
  # Kamal's SSL proxy terminates TLS, so we assume_ssl + force_ssl.
  if ENV["APP_HOST"].present?
    config.assume_ssl = true
    config.force_ssl = true
    config.ssl_options = { redirect: { exclude: ->(request) { request.path == "/up" } } }
  end

  # Log to STDOUT with the current request id as a default log tag.
  config.log_tags = [ :request_id ]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Change to "debug" to log everything (including potentially personally-identifiable information!).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Prevent health checks from clogging up the logs.
  config.silence_healthcheck_path = "/up"

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Replace the default in-process memory cache store with a durable alternative.
  config.cache_store = :solid_cache_store

  # Replace the default in-process and non-durable queuing backend for Active Job.
  config.active_job.queue_adapter = :solid_queue
  config.solid_queue.connects_to = { database: { writing: :queue } }

  # ─── Email (SMTP) ──────────────────────────────────────────────────────────
  # All SMTP settings are read from ENV so the client can configure them
  # without touching code or credentials:
  #
  #   SMTP_ADDRESS      — mail server host (default: smtp.gmail.com)
  #   SMTP_PORT         — port (default: 587)
  #   SMTP_USER         — login / email address
  #   SMTP_PASSWORD     — password or app-specific password
  #   MAIL_FROM         — "From:" header, e.g. "Space for Edu <noreply@spaceforedu.com>"
  #
  config.action_mailer.default_url_options = { host: ENV.fetch("APP_HOST_URL", "localhost") }

  if (smtp_user = ENV["SMTP_USER"]).present?
    config.action_mailer.raise_delivery_errors = true
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      user_name: smtp_user,
      password: ENV.fetch("SMTP_PASSWORD"),
      address: ENV.fetch("SMTP_ADDRESS", "smtp.gmail.com"),
      port: ENV.fetch("SMTP_PORT", 587).to_i,
      authentication: :plain,
      enable_starttls_auto: true
    }
  end

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  # ─── Host authorization (DNS rebinding protection) ─────────────────────────
  # Activated when APP_HOST is set.
  if ENV["APP_HOST"].present?
    config.hosts = [
      ENV["APP_HOST"],
      /.*\.#{Regexp.escape(ENV["APP_HOST"])}/
    ]
    config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
  end
end
