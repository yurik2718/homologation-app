require "test_helper"

module Admin
  class UsersControllerTest < ActionDispatch::IntegrationTest
    test "super admin can list users" do
      sign_in users(:super_admin_boss)
      get admin_users_path
      assert_response :ok
      assert_equal "admin/Users", inertia.component
    end

    test "super admin can create user" do
      sign_in users(:super_admin_boss)
      assert_difference "User.count", 1 do
        post admin_users_path, params: {
          user: { name: "New User", email_address: "new@test.com", password: "password123" }
        }
      end
    end

    test "super admin can assign role" do
      sign_in users(:super_admin_boss)
      post assign_role_admin_user_path(users(:student_ana)), params: { role_name: "coordinator" }
      assert users(:student_ana).reload.coordinator?
    end

    test "super admin can remove role" do
      sign_in users(:super_admin_boss)
      delete remove_role_admin_user_path(users(:student_ana)), params: { role_name: "student" }
      refute users(:student_ana).reload.student?
    end

    test "coordinator cannot manage users" do
      sign_in users(:coordinator_maria)
      get admin_users_path
      assert_response :forbidden
    end

    test "super admin can edit user" do
      sign_in users(:super_admin_boss)
      get edit_admin_user_path(users(:student_ana))
      assert_response :ok
    end

    test "super admin can update user" do
      sign_in users(:super_admin_boss)
      patch admin_user_path(users(:student_ana)), params: {
        user: { name: "Updated Name" }
      }
      assert_equal "Updated Name", users(:student_ana).reload.name
    end

    test "super admin can deactivate user (soft delete)" do
      sign_in users(:super_admin_boss)
      delete admin_user_path(users(:student_pedro))
      assert users(:student_pedro).reload.discarded?
    end

    test "users list props include users array" do
      sign_in users(:super_admin_boss)
      get admin_users_path
      assert_response :ok
      props = inertia.props
      assert props[:users].is_a?(Array)
    end

    # --- Cabinet flags ---

    test "users list includes hasHomologation and hasEducation fields" do
      sign_in users(:super_admin_boss)
      get admin_users_path
      user_data = inertia.props[:users].find { |u| u[:id] == users(:student_ana).id }
      assert_not_nil user_data
      assert user_data.key?(:hasHomologation) || user_data.key?("hasHomologation")
      assert user_data.key?(:hasEducation) || user_data.key?("hasEducation")
    end

    test "super admin can enable education cabinet for student" do
      sign_in users(:super_admin_boss)
      user = users(:student_ana)
      assert_not user.has_education?

      patch admin_user_path(user), params: {
        user: { has_homologation: true, has_education: true }
      }

      assert user.reload.has_education?
      assert user.reload.has_homologation?
    end

    test "super admin can switch student to education only" do
      sign_in users(:super_admin_boss)
      user = users(:student_ana)

      patch admin_user_path(user), params: {
        user: { has_homologation: false, has_education: true }
      }

      assert user.reload.has_education?
      refute user.reload.has_homologation?
    end

    test "cannot remove all cabinets from user" do
      sign_in users(:super_admin_boss)
      user = users(:student_ana)

      patch admin_user_path(user), params: {
        user: { has_homologation: false, has_education: false }
      }

      # User is unchanged — validation prevents saving
      assert user.reload.has_homologation?
    end
  end
end
