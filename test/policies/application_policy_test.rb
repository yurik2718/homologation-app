require "test_helper"

class ApplicationPolicyTest < ActiveSupport::TestCase
  # ApplicationPolicy is the default-deny base. Every subclass MUST opt-in to actions;
  # if a subclass forgets to override, the safest default should always be "denied".
  # These tests lock that contract down.

  setup do
    @user = create(:user, :student)
    @record = Object.new
    @policy = ApplicationPolicy.new(@user, @record)
  end

  test "denies index? by default" do
    refute @policy.index?
  end

  test "denies show? by default" do
    refute @policy.show?
  end

  test "denies create? by default" do
    refute @policy.create?
  end

  test "denies update? by default" do
    refute @policy.update?
  end

  test "denies destroy? by default" do
    refute @policy.destroy?
  end

  test "new? mirrors create?" do
    assert_equal @policy.create?, @policy.new?
  end

  test "edit? mirrors update?" do
    assert_equal @policy.update?, @policy.edit?
  end

  # === Scope — default must be none ===

  test "Scope.resolve returns none by default" do
    scope_class = Class.new(ApplicationPolicy::Scope)
    resolved = scope_class.new(@user, User).resolve
    assert_equal 0, resolved.count
  end

  # === coordinator_or_admin? helper ===

  test "coordinator_or_admin? is true for coordinators" do
    coordinator = create(:user, :coordinator)
    policy = ApplicationPolicy.new(coordinator, @record)
    assert policy.send(:coordinator_or_admin?)
  end

  test "coordinator_or_admin? is true for super_admins" do
    admin = create(:user, :super_admin)
    policy = ApplicationPolicy.new(admin, @record)
    assert policy.send(:coordinator_or_admin?)
  end

  test "coordinator_or_admin? is false for students" do
    refute @policy.send(:coordinator_or_admin?)
  end

  test "coordinator_or_admin? is false for teachers" do
    teacher = create(:user, :teacher)
    policy = ApplicationPolicy.new(teacher, @record)
    refute policy.send(:coordinator_or_admin?)
  end
end
