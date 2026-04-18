require "test_helper"

class AdminLessonPolicyTest < ActiveSupport::TestCase
  # Admin lesson views aggregate across teachers/students — available to staff only.
  # Teachers and students must go through their own scoped lesson views.
  setup do
    @record = Object.new
  end

  test "super_admin can access admin lessons index" do
    assert AdminLessonPolicy.new(create(:user, :super_admin), @record).index?
  end

  test "coordinator can access admin lessons index" do
    assert AdminLessonPolicy.new(create(:user, :coordinator), @record).index?
  end

  test "teacher cannot access admin lessons index" do
    refute AdminLessonPolicy.new(create(:user, :teacher), @record).index?
  end

  test "student cannot access admin lessons index" do
    refute AdminLessonPolicy.new(create(:user, :student), @record).index?
  end
end
