require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @existing_student = create(:user, :student)
  end

  test "GET /registration/new renders register page" do
    get new_registration_path
    assert_response :ok
    assert_equal "auth/Register", inertia.component
  end

  test "POST /registration creates user with student role" do
    assert_difference "User.count", 1 do
      post registration_path, params: {
        name: "Test User", email_address: "newuser@example.com",
        password: "password123", password_confirmation: "password123",
        privacy_accepted: "1"
      }
    end
    user = User.find_by(email_address: "newuser@example.com")
    assert_not_nil user
    assert user.student?
    assert_redirected_to dashboard_path
  end

  test "POST /registration with duplicate email does not create user" do
    post registration_path, params: {
      name: "Dup", email_address: @existing_student.email_address,
      password: "password123", password_confirmation: "password123",
      privacy_accepted: "1"
    }
    assert_equal 1, User.where(email_address: @existing_student.email_address).count
  end

  test "POST /registration with mismatched passwords does not create user" do
    assert_no_difference "User.count" do
      post registration_path, params: {
        name: "Test", email_address: "mismatch@example.com",
        password: "password123", password_confirmation: "different",
        privacy_accepted: "1"
      }
    end
  end

  # --- privacy consent ---

  test "POST /registration saves privacy_accepted_at when privacy accepted" do
    post registration_path, params: {
      name: "Privacy User", email_address: "privacy@example.com",
      password: "password123", password_confirmation: "password123",
      privacy_accepted: "1"
    }
    user = User.find_by(email_address: "privacy@example.com")
    assert_not_nil user
    assert_not_nil user.privacy_accepted_at
  end

  test "POST /registration without privacy_accepted does not create user" do
    assert_no_difference "User.count" do
      post registration_path, params: {
        name: "No Privacy", email_address: "noprivacy@example.com",
        password: "password123", password_confirmation: "password123"
      }
    end
  end

  test "POST /registration without privacy_accepted redirects back with error" do
    post registration_path, params: {
      name: "No Privacy", email_address: "noprivacy@example.com",
      password: "password123", password_confirmation: "password123"
    }
    assert_redirected_to new_registration_path
  end

  test "POST /registration with explicit privacy_accepted false does not create user" do
    assert_no_difference "User.count" do
      post registration_path, params: {
        name: "No Privacy", email_address: "falseprivacy@example.com",
        password: "password123", password_confirmation: "password123",
        privacy_accepted: false
      }
    end
  end

  test "POST /registration privacy_accepted_at is set close to current time" do
    freeze_time do
      post registration_path, params: {
        name: "Time User", email_address: "timeuser@example.com",
        password: "password123", password_confirmation: "password123",
        privacy_accepted: "1"
      }
      user = User.find_by(email_address: "timeuser@example.com")
      assert_equal Time.current, user.privacy_accepted_at
    end
  end
end
