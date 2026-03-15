require "test_helper"

module Auth
  class OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
    setup do
      OmniAuth.config.test_mode = true
    end

    teardown do
      OmniAuth.config.test_mode = false
      OmniAuth.config.mock_auth.clear
    end

    test "GET /auth/failure redirects to login with alert" do
      get "/auth/failure"
      assert_redirected_to new_session_path
    end

    test "OAuth creates new user with student role and logs in" do
      OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
        "provider" => "google_oauth2",
        "uid" => "google_uid_123",
        "info" => { "email" => "oauth_new@example.com", "name" => "OAuth User", "image" => nil }
      )
      assert_difference "User.count", 1 do
        post "/auth/google_oauth2"
        follow_redirect!
      end
      assert_redirected_to root_path
      user = User.find_by(email_address: "oauth_new@example.com")
      assert_not_nil user
      assert user.student?
    end

    test "OAuth finds existing user by email and logs in" do
      existing_user = users(:student_ana)
      OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
        "provider" => "google_oauth2",
        "uid" => "google_uid_existing",
        "info" => {
          "email" => existing_user.email_address,
          "name" => existing_user.name,
          "image" => nil
        }
      )
      assert_no_difference "User.count" do
        post "/auth/google_oauth2"
        follow_redirect!
      end
      assert_redirected_to root_path
    end
  end
end
