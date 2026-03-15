require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup { @user = users(:student_ana) }

  test "GET /session/new renders login page" do
    get new_session_path
    assert_response :ok
    assert_equal "auth/Login", inertia.component
  end

  test "POST /session with valid credentials logs in" do
    post session_path, params: { email_address: @user.email_address, password: "password123" }
    assert_redirected_to root_path
    assert cookies[:session_id]
  end

  test "POST /session with invalid credentials redirects to login" do
    post session_path, params: { email_address: @user.email_address, password: "wrong" }
    assert_redirected_to new_session_path
    assert_nil cookies[:session_id]
  end

  test "DELETE /session logs out" do
    sign_in @user
    delete session_path
    assert_redirected_to new_session_path
    assert_empty cookies[:session_id]
  end
end
