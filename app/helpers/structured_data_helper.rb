# frozen_string_literal: true

module StructuredDataHelper
  SITE_NAME = "Space for Edu"
  FOUNDING_YEAR = 2014
  SOCIAL_PROFILES = [].freeze

  def canonical_base_url(request)
    ENV.fetch("APP_HOST_URL") { request.base_url }
  end

  def localized_url(request, locale, path = "/")
    suffix = path == "/" ? "" : path
    "#{canonical_base_url(request)}/#{locale}#{suffix}"
  end

  # Organization / EducationalOrganization — site-wide, rendered server-side.
  def organization_schema(request, locale)
    {
      "@context" => "https://schema.org",
      "@type" => "EducationalOrganization",
      "@id" => "#{canonical_base_url(request)}/#organization",
      "name" => SITE_NAME,
      "url" => localized_url(request, locale),
      "logo" => "#{canonical_base_url(request)}/favicon-96x96.png",
      "foundingDate" => FOUNDING_YEAR.to_s,
      "areaServed" => { "@type" => "Country", "name" => "Spain" },
      "description" => I18n.t("seo.organization.description", locale: locale, default: I18n.t("seo.home.description", locale: locale)),
      "knowsLanguage" => %w[es en ru],
      "sameAs" => SOCIAL_PROFILES
    }.compact
  end

  def website_schema(request, locale)
    {
      "@context" => "https://schema.org",
      "@type" => "WebSite",
      "@id" => "#{canonical_base_url(request)}/#website",
      "url" => localized_url(request, locale),
      "name" => SITE_NAME,
      "inLanguage" => locale,
      "publisher" => { "@id" => "#{canonical_base_url(request)}/#organization" }
    }
  end

  def breadcrumb_schema(request, locale, items)
    {
      "@context" => "https://schema.org",
      "@type" => "BreadcrumbList",
      "itemListElement" => items.each_with_index.map do |(name, path), idx|
        {
          "@type" => "ListItem",
          "position" => idx + 1,
          "name" => name,
          "item" => localized_url(request, locale, path)
        }
      end
    }
  end

  SERVICE_DEFS = {
    "homologation" => { path: "/homologation", type: "Service" },
    "university" => { path: "/university", type: "Service" },
    "spanish" => { path: "/spanish", type: "Service" }
  }.freeze

  def service_schema(request, locale, key)
    defn = SERVICE_DEFS.fetch(key)
    {
      "@context" => "https://schema.org",
      "@type" => defn[:type],
      "name" => I18n.t("seo.#{key}.title", locale: locale),
      "description" => I18n.t("seo.#{key}.description", locale: locale),
      "provider" => { "@id" => "#{canonical_base_url(request)}/#organization" },
      "areaServed" => { "@type" => "Country", "name" => "Spain" },
      "url" => localized_url(request, locale, defn[:path]),
      "inLanguage" => locale
    }
  end

  # Per-page structured data. Returns an array of schema hashes to inject as JSON-LD.
  def structured_data_for(action_name, request, locale)
    home_label = I18n.t("seo.breadcrumbs.home", locale: locale, default: "Home")

    case action_name
    when "home"
      [
        breadcrumb_schema(request, locale, [ [ home_label, "/" ] ]),
        service_schema(request, locale, "homologation"),
        service_schema(request, locale, "university"),
        service_schema(request, locale, "spanish")
      ]
    when "homologation", "university", "spanish"
      label = I18n.t("seo.#{action_name}.title", locale: locale)
      [
        breadcrumb_schema(request, locale, [ [ home_label, "/" ], [ label, SERVICE_DEFS[action_name][:path] ] ]),
        service_schema(request, locale, action_name)
      ]
    when "pricing"
      label = I18n.t("seo.pricing.title", locale: locale)
      [ breadcrumb_schema(request, locale, [ [ home_label, "/" ], [ label, "/pricing" ] ]) ]
    else
      []
    end
  end
end
