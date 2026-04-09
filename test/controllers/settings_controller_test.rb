require "test_helper"

class SettingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = create(:user, :student)
    @coordinator = create(:user, :coordinator)
    @teacher = create(:user, :teacher)
  end

  # --- profile ---

  test "student can view settings profile" do
    sign_in @student
    get settings_profile_path
    assert_response :ok
    assert_equal "settings/Profile", inertia.component
  end

  test "coordinator can view settings profile" do
    sign_in @coordinator
    get settings_profile_path
    assert_response :ok
  end

  test "unauthenticated user is redirected from settings" do
    get settings_profile_path
    assert_redirected_to new_session_path
  end

  test "student can update profile via settings" do
    sign_in @student
    patch settings_profile_path, params: {
      name: "Ana Updated",
      whatsapp: "+34600000001",
      birthday: "2000-01-01",
      country: "ES",
      locale: "es"
    }
    assert_redirected_to settings_profile_path
    assert_equal "Ana Updated", @student.reload.name
  end

  # --- account ---

  test "student can view settings account" do
    sign_in @student
    get settings_account_path
    assert_response :ok
    assert_equal "settings/Account", inertia.component
  end

  test "student cannot change password with wrong current password" do
    sign_in @student
    patch settings_account_path, params: {
      current_password: "wrongpassword",
      password: "newpassword123",
      password_confirmation: "newpassword123"
    }
    assert_redirected_to settings_account_path
  end

  # --- notifications ---

  test "student can view settings notifications" do
    sign_in @student
    get settings_notifications_path
    assert_response :ok
    assert_equal "settings/Notifications", inertia.component
  end

  test "student can update notification preferences" do
    sign_in @student
    patch settings_notifications_path, params: { notification_email: "0" }
    assert_redirected_to settings_notifications_path
    assert_equal false, @student.reload.notification_email
  end

  # --- request_deletion ---

  test "student can request account deletion" do
    sign_in @student
    assert_nil @student.deletion_requested_at
    post settings_request_deletion_path
    assert_redirected_to settings_account_path
    assert_not_nil @student.reload.deletion_requested_at
  end

  test "student cannot request deletion twice" do
    @student.update!(deletion_requested_at: Time.current)
    sign_in @student
    post settings_request_deletion_path
    assert_redirected_to settings_account_path
    # still redirects, no error
  end

  # --- /settings root redirects ---

  test "GET /settings redirects to settings profile" do
    sign_in @student
    get "/settings"
    assert_redirected_to settings_profile_path
  end

  # --- data_export ---

  test "student can download data export as JSON attachment" do
    sign_in @student
    get settings_data_export_path
    assert_response :ok
    assert_includes response.content_type, "application/json"
    assert_includes response.headers["Content-Disposition"], "attachment"
  end

  test "data export contains user profile fields" do
    sign_in @student
    get settings_data_export_path
    data = JSON.parse(response.body)

    assert_equal @student.name, data["user"]["name"]
    assert_equal @student.email_address, data["user"]["email"]
    assert data.key?("exported_at")
  end

  test "data export contains requests and lessons arrays" do
    sign_in @student
    get settings_data_export_path
    data = JSON.parse(response.body)

    assert data.key?("homologation_requests")
    assert data.key?("lessons")
    assert_kind_of Array, data["homologation_requests"]
    assert_kind_of Array, data["lessons"]
  end

  test "data export filename includes today's date" do
    sign_in @student
    get settings_data_export_path
    assert_includes response.headers["Content-Disposition"], Date.current.to_s
  end

  test "unauthenticated user cannot access data export" do
    get settings_data_export_path
    assert_redirected_to new_session_path
  end

  test "student cannot download another user's data export" do
    other = create(:user, :student)
    sign_in @student
    # data_export always exports Current.user — no way to specify another user
    get settings_data_export_path
    data = JSON.parse(response.body)
    refute_equal other.email_address, data["user"]["email"]
  end
end
