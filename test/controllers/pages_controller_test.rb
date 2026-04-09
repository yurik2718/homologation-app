require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "privacy policy page is accessible without authentication" do
    get privacy_policy_path
    assert_response :ok
    assert_equal "PrivacyPolicy", inertia.component
  end

  test "privacy policy page is accessible when authenticated" do
    sign_in create(:user, :student)
    get privacy_policy_path
    assert_response :ok
    assert_equal "PrivacyPolicy", inertia.component
  end

  test "root redirects to locale based on Accept-Language" do
    get root_path, headers: { "Accept-Language" => "ru,en;q=0.9" }
    assert_redirected_to localized_home_path(locale: "ru")
  end

  test "root redirects to /en/ for unsupported language" do
    get root_path, headers: { "Accept-Language" => "zh" }
    assert_redirected_to localized_home_path(locale: "en")
  end

  test "root redirects logged-in user to localized home" do
    sign_in create(:user, :student)
    get root_path
    assert_response :redirect
  end

  test "home page renders with es locale" do
    get localized_home_path(locale: "es")
    assert_response :ok
    assert_equal "public/Home", inertia.component
    assert_equal "es", inertia.props[:seo][:locale]
  end

  test "home page renders with en locale" do
    get localized_home_path(locale: "en")
    assert_response :ok
    assert_equal "public/Home", inertia.component
    assert_equal "en", inertia.props[:seo][:locale]
  end

  test "home page renders with ru locale" do
    get localized_home_path(locale: "ru")
    assert_response :ok
    assert_equal "public/Home", inertia.component
    assert_equal "ru", inertia.props[:seo][:locale]
  end

  test "home page is accessible to logged-in user" do
    sign_in create(:user, :student)
    get localized_home_path(locale: "en")
    assert_response :ok
    assert_equal "public/Home", inertia.component
  end

  test "homologation page renders" do
    get localized_homologation_path(locale: "es")
    assert_response :ok
    assert_equal "public/Homologacion", inertia.component
    assert inertia.props[:seo].present?
  end

  test "university page renders" do
    get localized_university_path(locale: "en")
    assert_response :ok
    assert_equal "public/Universidad", inertia.component
  end

  test "spanish page renders" do
    get localized_spanish_path(locale: "ru")
    assert_response :ok
    assert_equal "public/Espanol", inertia.component
  end

  test "pricing page renders" do
    get localized_pricing_path(locale: "en")
    assert_response :ok
    assert_equal "public/Precios", inertia.component
  end

  test "SEO props include 3 alternates" do
    get localized_home_path(locale: "es")
    seo = inertia.props[:seo]
    assert_equal 3, seo[:alternates].length
    assert seo[:alternates].any? { |a| a[:locale] == "es" }
    assert seo[:alternates].any? { |a| a[:locale] == "en" }
    assert seo[:alternates].any? { |a| a[:locale] == "ru" }
  end

  test "SEO alternate URLs include locale prefix" do
    get localized_homologation_path(locale: "en")
    seo = inertia.props[:seo]
    en_alt = seo[:alternates].find { |a| a[:locale] == "en" }
    assert_match %r{/en/homologation}, en_alt[:url]
    es_alt = seo[:alternates].find { |a| a[:locale] == "es" }
    assert_match %r{/es/homologation}, es_alt[:url]
  end
end
