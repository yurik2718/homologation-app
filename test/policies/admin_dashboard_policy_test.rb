require "test_helper"

class AdminDashboardPolicyTest < ActiveSupport::TestCase
  # The admin dashboard is super_admin-only. Coordinators, teachers, students
  # MUST NOT see it — it exposes cross-user data, billing, and system health.
  setup do
    @record = Object.new
  end

  test "super_admin can access admin dashboard" do
    assert AdminDashboardPolicy.new(create(:user, :super_admin), @record).index?
  end

  test "coordinator cannot access admin dashboard" do
    refute AdminDashboardPolicy.new(create(:user, :coordinator), @record).index?
  end

  test "teacher cannot access admin dashboard" do
    refute AdminDashboardPolicy.new(create(:user, :teacher), @record).index?
  end

  test "student cannot access admin dashboard" do
    refute AdminDashboardPolicy.new(create(:user, :student), @record).index?
  end

  test "user with no role cannot access admin dashboard" do
    # Factory without a role trait assigns no roles
    refute AdminDashboardPolicy.new(create(:user), @record).index?
  end
end
