require "test_helper"

module Auth
  class OmniauthCallbacksControllerTest < ActionDispatch::IntegrationTest
    setup do
      OmniAuth.config.test_mode = true
      @existing_student = create(:user, :student)
    end

    teardown do
      OmniAuth.config.test_mode = false
      OmniAuth.config.mock_auth.clear
    end

    # ─── Failure ──────────────────────────────────────────────────────────────

    test "GET /auth/failure redirects to login with alert" do
      get "/auth/failure"
      assert_redirected_to new_session_path
    end

    # ─── Google OAuth ─────────────────────────────────────────────────────────

    test "Google OAuth creates new user with student role and logs in" do
      mock_google(email: "new_google@example.com", name: "Google User")

      assert_difference "User.count", 1 do
        post "/auth/google_oauth2"
        follow_redirect!
      end
      assert_redirected_to dashboard_path

      user = User.find_by(email_address: "new_google@example.com")
      assert_equal "Google User", user.name
      assert_equal "google_oauth2", user.provider
      assert user.student?
    end

    test "Google OAuth finds existing user by email and links account" do
      mock_google(email: @existing_student.email_address, name: @existing_student.name)

      assert_no_difference "User.count" do
        post "/auth/google_oauth2"
        follow_redirect!
      end
      assert_redirected_to dashboard_path

      @existing_student.reload
      assert_equal "google_oauth2", @existing_student.provider
      assert_equal "google_uid_456", @existing_student.uid
    end

    test "Google OAuth finds existing user by provider+uid on repeat login" do
      @existing_student.update_columns(provider: "google_oauth2", uid: "google_uid_repeat")
      mock_google(uid: "google_uid_repeat", email: @existing_student.email_address, name: @existing_student.name)

      assert_no_difference "User.count" do
        post "/auth/google_oauth2"
        follow_redirect!
      end
      assert_redirected_to dashboard_path
    end

    # ─── Facebook OAuth ───────────────────────────────────────────────────────

    test "Facebook OAuth creates new user with student role and logs in" do
      mock_facebook(email: "new_fb@example.com", name: "Facebook User")

      assert_difference "User.count", 1 do
        post "/auth/facebook"
        follow_redirect!
      end
      assert_redirected_to dashboard_path

      user = User.find_by(email_address: "new_fb@example.com")
      assert_equal "Facebook User", user.name
      assert_equal "facebook", user.provider
      assert user.student?
    end

    test "Facebook OAuth finds existing user by email and links account" do
      mock_facebook(email: @existing_student.email_address, name: @existing_student.name)

      assert_no_difference "User.count" do
        post "/auth/facebook"
        follow_redirect!
      end
      assert_redirected_to dashboard_path

      @existing_student.reload
      assert_equal "facebook", @existing_student.provider
    end

    test "Facebook OAuth finds existing user by provider+uid on repeat login" do
      @existing_student.update_columns(provider: "facebook", uid: "fb_uid_repeat")
      mock_facebook(uid: "fb_uid_repeat", email: @existing_student.email_address, name: @existing_student.name)

      assert_no_difference "User.count" do
        post "/auth/facebook"
        follow_redirect!
      end
      assert_redirected_to dashboard_path
    end

    # ─── Edge cases ───────────────────────────────────────────────────────────

    test "OAuth user without avatar_url is created successfully" do
      mock_google(email: "noavatar@example.com", name: "No Avatar", image: nil)

      assert_difference "User.count", 1 do
        post "/auth/google_oauth2"
        follow_redirect!
      end

      user = User.find_by(email_address: "noavatar@example.com")
      assert_nil user.avatar_url
    end

    test "OAuth user with avatar_url stores it" do
      mock_facebook(email: "avatar@example.com", name: "Has Avatar", image: "https://graph.facebook.com/123/picture")

      assert_difference "User.count", 1 do
        post "/auth/facebook"
        follow_redirect!
      end

      user = User.find_by(email_address: "avatar@example.com")
      assert_equal "https://graph.facebook.com/123/picture", user.avatar_url
    end

    # ─── Session / security ──────────────────────────────────────────────────

    test "successful OAuth login creates a persisted session and signed cookie" do
      mock_google(email: "sess_#{Process.pid}@example.com", name: "Session User")

      assert_difference -> { Session.count }, 1 do
        post "/auth/google_oauth2"
        follow_redirect!
      end

      # Cookie present → user is effectively signed in for subsequent requests
      assert_not_nil cookies["session_id"], "session cookie must be set after OAuth"
    end

    test "OAuth email match normalizes case (uppercase payload matches lowercase stored)" do
      # User.email_address is normalized to lowercase via `normalizes :email_address`.
      # OAuth providers sometimes return uppercased / mixed-case emails.
      mock_google(email: @existing_student.email_address.upcase, name: @existing_student.name)

      assert_no_difference "User.count" do
        post "/auth/google_oauth2"
        follow_redirect!
      end

      @existing_student.reload
      assert_equal "google_oauth2", @existing_student.provider
    end

    test "OmniAuth invalid_credentials triggers failure flow without creating user" do
      OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

      assert_no_difference "User.count" do
        post "/auth/google_oauth2"
        # OmniAuth middleware redirects to /auth/failure; follow and let the
        # controller's failure action redirect to login with a flash.
        follow_redirect! while response.redirect? && response.location !~ %r{/session/new\z}
      end

      assert_match %r{/session/new\z}, response.location
    end

    test "re-login via same provider+uid does not overwrite stored uid" do
      # Defense: once a provider+uid is bound, we must not silently update it.
      # (The model only touches uid when it was blank.)
      @existing_student.update_columns(provider: "google_oauth2", uid: "original_uid")
      mock_google(uid: "different_uid_attack", email: @existing_student.email_address, name: @existing_student.name)

      post "/auth/google_oauth2"
      follow_redirect!

      @existing_student.reload
      assert_equal "original_uid", @existing_student.uid, "stored uid must not be overwritten by a second login"
    end

    private

    def mock_google(email:, name:, uid: "google_uid_456", image: nil)
      OmniAuth.config.mock_auth[:google_oauth2] = OmniAuth::AuthHash.new(
        "provider" => "google_oauth2",
        "uid" => uid,
        "info" => { "email" => email, "name" => name, "image" => image }
      )
    end

    def mock_facebook(email:, name:, uid: "fb_uid_456", image: nil)
      OmniAuth.config.mock_auth[:facebook] = OmniAuth::AuthHash.new(
        "provider" => "facebook",
        "uid" => uid,
        "info" => { "email" => email, "name" => name, "image" => image }
      )
    end
  end
end
