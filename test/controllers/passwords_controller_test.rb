require "test_helper"

class PasswordsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = users(:student_ana) }

  test "GET /passwords/new renders forgot password page" do
    get new_password_path
    assert_response :ok
    assert_equal "auth/ForgotPassword", inertia.component
  end

  test "POST /passwords sends reset email and redirects to login" do
    post passwords_path, params: { email_address: @user.email_address }
    assert_enqueued_email_with PasswordsMailer, :reset, args: [ @user ]
    assert_redirected_to new_session_path
  end

  test "POST /passwords for unknown email redirects but sends no mail" do
    post passwords_path, params: { email_address: "missing@example.com" }
    assert_enqueued_emails 0
    assert_redirected_to new_session_path
  end

  test "GET /passwords/:token/edit renders reset password page" do
    get edit_password_path(@user.password_reset_token)
    assert_response :ok
    assert_equal "auth/ResetPassword", inertia.component
  end

  test "GET /passwords/:token/edit with invalid token redirects" do
    get edit_password_path("invalid-token")
    assert_redirected_to new_password_path
  end

  test "PUT /passwords/:token updates password" do
    assert_changes -> { @user.reload.password_digest } do
      put password_path(@user.password_reset_token),
          params: { password: "newpassword123", password_confirmation: "newpassword123" }
      assert_redirected_to new_session_path
    end
  end

  test "PUT /passwords/:token with mismatched passwords redirects back" do
    token = @user.password_reset_token
    assert_no_changes -> { @user.reload.password_digest } do
      put password_path(token),
          params: { password: "newpassword123", password_confirmation: "doesnotmatch" }
      assert_redirected_to edit_password_path(token)
    end
  end
end
