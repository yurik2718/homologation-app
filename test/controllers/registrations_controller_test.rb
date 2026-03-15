require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "GET /registration/new renders register page" do
    get new_registration_path
    assert_response :ok
    assert_equal "auth/Register", inertia.component
  end

  test "POST /registration creates user with student role" do
    assert_difference "User.count", 1 do
      post registration_path, params: {
        name: "Test User", email_address: "newuser@example.com",
        password: "password123", password_confirmation: "password123"
      }
    end
    user = User.find_by(email_address: "newuser@example.com")
    assert_not_nil user
    assert user.student?
    assert_redirected_to root_path
  end

  test "POST /registration with duplicate email does not create user" do
    post registration_path, params: {
      name: "Dup", email_address: users(:student_ana).email_address,
      password: "password123", password_confirmation: "password123"
    }
    assert_equal 1, User.where(email_address: users(:student_ana).email_address).count
  end

  test "POST /registration with mismatched passwords does not create user" do
    assert_no_difference "User.count" do
      post registration_path, params: {
        name: "Test", email_address: "mismatch@example.com",
        password: "password123", password_confirmation: "different"
      }
    end
  end
end
