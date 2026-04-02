require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module HomologationApp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # i18n: 3 languages, Spanish default
    config.i18n.available_locales = %i[es en ru]
    config.i18n.default_locale = :es
    config.i18n.fallbacks = true

    # Select options loaded once at boot — shared via inertia_share on every request.
    # Each file in config/select_options/*.yml becomes a key (filename → key).
    # To add a new dropdown: create config/select_options/my_list.yml and restart.
    config.select_options = Dir[Rails.root.join("config/select_options/*.yml")].each_with_object({}) do |path, hash|
      key = File.basename(path, ".yml")
      hash[key] = YAML.safe_load_file(path)
    end.freeze

    # Pipeline config: stages, document checklist, country routing.
    # Single source of truth for both backend (model) and frontend (inertia_share).
    config.pipeline = YAML.safe_load_file(Rails.root.join("config/pipeline.yml")).freeze
  end
end
