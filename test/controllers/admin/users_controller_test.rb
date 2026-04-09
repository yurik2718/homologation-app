require "test_helper"

module Admin
  class UsersControllerTest < ActionDispatch::IntegrationTest
    setup do
      @admin = create(:user, :super_admin)
      @coordinator = create(:user, :coordinator)
      @student = create(:user, :student)
      @other_student = create(:user, :student)
    end

    test "super admin can list users" do
      sign_in @admin
      get admin_users_path
      assert_response :ok
      assert_equal "admin/Users", inertia.component
    end

    test "super admin can create user" do
      sign_in @admin
      assert_difference "User.count", 1 do
        post admin_users_path, params: {
          user: { name: "New User", email_address: "new@test.com", password: "password123" }
        }
      end
    end

    test "super admin can assign role" do
      sign_in @admin
      post assign_role_admin_user_path(@student), params: { role_name: "coordinator" }
      assert @student.reload.coordinator?
    end

    test "super admin can remove role" do
      sign_in @admin
      delete remove_role_admin_user_path(@student), params: { role_name: "student" }
      refute @student.reload.student?
    end

    test "coordinator cannot manage users" do
      sign_in @coordinator
      get admin_users_path
      assert_response :forbidden
    end

    test "super admin can edit user" do
      sign_in @admin
      get edit_admin_user_path(@student)
      assert_response :ok
    end

    test "super admin can update user" do
      sign_in @admin
      patch admin_user_path(@student), params: {
        user: { name: "Updated Name" }
      }
      assert_equal "Updated Name", @student.reload.name
    end

    test "super admin can deactivate user (soft delete)" do
      sign_in @admin
      delete admin_user_path(@other_student)
      assert @other_student.reload.discarded?
    end

    # --- gdpr_delete ---

    test "super admin can GDPR delete user and anonymizes PII" do
      sign_in @admin
      delete gdpr_delete_admin_user_path(@student)

      @student.reload
      assert @student.discarded?
      assert_equal "Deleted User ##{@student.id}", @student.name
      assert_equal "deleted_#{@student.id}@gdpr.invalid", @student.email_address
      assert_nil @student.phone
      assert_nil @student.whatsapp
      assert_nil @student.birthday
    end

    test "super admin GDPR delete redirects to users list with notice" do
      sign_in @admin
      delete gdpr_delete_admin_user_path(@student)
      assert_redirected_to admin_users_path
      assert_equal I18n.t("flash.user_gdpr_deleted"), flash[:notice]
    end

    test "coordinator cannot GDPR delete user" do
      sign_in @coordinator
      delete gdpr_delete_admin_user_path(@student)
      assert_response :forbidden
    end

    test "GDPR delete destroys user sessions" do
      @student.sessions.create!
      sign_in @admin
      delete gdpr_delete_admin_user_path(@student)
      assert_equal 0, @student.reload.sessions.count
    end

    test "users list props include users array" do
      sign_in @admin
      get admin_users_path
      assert_response :ok
      props = inertia.props
      assert props[:users].is_a?(Array)
    end

    # --- Cabinet flags ---

    test "users list includes hasHomologation and hasEducation fields" do
      sign_in @admin
      get admin_users_path
      user_data = inertia.props[:users].find { |u| u[:id] == @student.id }
      assert_not_nil user_data
      assert user_data.key?(:hasHomologation) || user_data.key?("hasHomologation")
      assert user_data.key?(:hasEducation) || user_data.key?("hasEducation")
    end

    test "super admin can enable education cabinet for student" do
      sign_in @admin
      assert_not @student.has_education?

      patch admin_user_path(@student), params: {
        user: { has_homologation: true, has_education: true }
      }

      assert @student.reload.has_education?
      assert @student.reload.has_homologation?
    end

    test "super admin can switch student to education only" do
      sign_in @admin

      patch admin_user_path(@student), params: {
        user: { has_homologation: false, has_education: true }
      }

      assert @student.reload.has_education?
      refute @student.reload.has_homologation?
    end

    test "cannot remove all cabinets from user" do
      sign_in @admin

      patch admin_user_path(@student), params: {
        user: { has_homologation: false, has_education: false }
      }

      assert_redirected_to admin_users_path
      assert @student.reload.has_homologation?
    end

    test "newly created user has homologation cabinet by default" do
      sign_in @admin
      post admin_users_path, params: {
        user: { name: "Cabinet Test", email_address: "cabinet@test.com", password: "password123" }
      }
      new_user = User.find_by(email_address: "cabinet@test.com")
      assert new_user.has_homologation?
      refute new_user.has_education?
    end
  end
end
