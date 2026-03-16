require "test_helper"

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  test "student can view profile" do
    sign_in users(:student_ana)
    get edit_profile_path
    assert_response :ok
    assert_equal "profile/Edit", inertia.component
  end

  test "student can update profile" do
    sign_in users(:student_ana)
    patch profile_path, params: { whatsapp: "+34999999999", country: "ES" }
    assert_redirected_to root_path
    assert_equal "+34999999999", users(:student_ana).reload.whatsapp
  end

  test "incomplete profile redirects to edit" do
    user = users(:student_ana)
    user.update_columns(whatsapp: nil)
    sign_in user
    get root_path
    assert_redirected_to edit_profile_path
  end

  test "locale update saves to user" do
    sign_in users(:student_ana)
    patch profile_path, params: { locale: "ru" }
    assert_equal "ru", users(:student_ana).reload.locale
  end

  test "minor fields are saved" do
    sign_in users(:student_ana)
    patch profile_path, params: { is_minor: true, guardian_name: "Mama", guardian_email: "mama@test.com" }
    reloaded = users(:student_ana).reload
    assert reloaded.is_minor?
    assert_equal "Mama", reloaded.guardian_name
  end

  test "connect_telegram generates token and redirects to bot" do
    sign_in users(:student_ana)
    post connect_telegram_profile_path
    assert users(:student_ana).reload.telegram_link_token.present?
    assert_response :redirect
  end

  test "disconnect_telegram clears chat_id" do
    user = users(:student_ana)
    user.update!(telegram_chat_id: "123", notification_telegram: true)
    sign_in user
    delete disconnect_telegram_profile_path
    assert_nil user.reload.telegram_chat_id
    refute user.notification_telegram?
  end
end
