class PagesController < ApplicationController
  include StructuredDataHelper

  allow_unauthenticated_access
  before_action :resume_session
  # Server-render the page title into the layout. Inertia Head still manages
  # it on client navigation, but this closes the hydration gap where Lighthouse
  # (and non-JS crawlers) saw only the "Space for Edu" fallback.
  before_action :set_page_title, only: %i[home homologation university spanish pricing consultation_thank_you privacy_policy]

  def redirect_to_locale
    locale = current_user&.locale || detect_locale
    redirect_to localized_home_path(locale: locale)
  end

  def home
    render inertia: "public/Home", props: { seo: seo_props }
  end

  def homologation
    render inertia: "public/Homologacion", props: { seo: seo_props }
  end

  def university
    render inertia: "public/Universidad", props: { seo: seo_props }
  end

  def spanish
    render inertia: "public/Espanol", props: { seo: seo_props }
  end

  def pricing
    render inertia: "public/Precios", props: { seo: seo_props }
  end

  def consultation_thank_you
    render inertia: "public/ConsultationThankYou", props: { seo: seo_props }
  end

  def privacy_policy
    render inertia: "PrivacyPolicy"
  end

  private

  def set_page_title
    @page_title = I18n.t("seo.#{action_name}.title", default: nil)
  end

  SUPPORTED_LOCALES = I18n.available_locales.map(&:to_s).freeze
  DEFAULT_LOCALE = "en".freeze

  def detect_locale
    extract_locale_from_header || DEFAULT_LOCALE
  end

  def seo_props
    locale = params[:locale]
    {
      locale: locale,
      alternates: SUPPORTED_LOCALES.map { |l| { locale: l, url: localized_page_url(l) } },
      canonicalUrl: localized_page_url(locale),
      title: t("seo.#{action_name}.title"),
      description: t("seo.#{action_name}.description"),
      structuredData: structured_data_for(action_name, request, locale),
      breadcrumbs: breadcrumb_items_for(action_name, locale)
    }
  end

  # Visible breadcrumb chain. Mirrors the BreadcrumbList JSON-LD so UI and
  # structured data stay in lockstep. Home pages return an empty list — no
  # visible breadcrumbs at the root.
  def breadcrumb_items_for(action_name, locale)
    home_label = I18n.t("seo.breadcrumbs.home", locale: locale, default: "Home")
    case action_name
    when "homologation", "university", "spanish", "pricing"
      page_label = I18n.t("seo.#{action_name}.title", locale: locale)
      [
        { name: home_label, href: "/#{locale}" },
        { name: page_label, href: nil }
      ]
    when "consultation_thank_you"
      [
        { name: home_label, href: "/#{locale}" },
        { name: I18n.t("seo.consultation_thank_you.title", locale: locale), href: nil }
      ]
    else
      []
    end
  end

  def localized_page_url(locale)
    if action_name == "home"
      localized_home_url(locale: locale)
    else
      url_for(controller: "pages", action: action_name, locale: locale, only_path: false)
    end
  rescue ActionController::UrlGenerationError
    localized_home_url(locale: locale)
  end
end
