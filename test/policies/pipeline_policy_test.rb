require "test_helper"

class PipelinePolicyTest < ActiveSupport::TestCase
  # The pipeline board is a super_admin-only coordinator tool showing
  # cross-client kanban state + stage transitions. Must NEVER leak to students,
  # teachers, or even coordinators (they use the admin lesson views instead).
  setup do
    @record = Object.new
  end

  test "super_admin can view pipeline" do
    assert PipelinePolicy.new(create(:user, :super_admin), @record).index?
  end

  test "coordinator cannot view pipeline" do
    refute PipelinePolicy.new(create(:user, :coordinator), @record).index?
  end

  test "teacher cannot view pipeline" do
    refute PipelinePolicy.new(create(:user, :teacher), @record).index?
  end

  test "student cannot view pipeline" do
    refute PipelinePolicy.new(create(:user, :student), @record).index?
  end

  # === manage_pipeline? — stage transitions, assignments, etc. ===

  test "super_admin can manage pipeline" do
    assert PipelinePolicy.new(create(:user, :super_admin), @record).manage_pipeline?
  end

  test "coordinator cannot manage pipeline" do
    refute PipelinePolicy.new(create(:user, :coordinator), @record).manage_pipeline?
  end

  test "teacher cannot manage pipeline" do
    refute PipelinePolicy.new(create(:user, :teacher), @record).manage_pipeline?
  end

  test "student cannot manage pipeline" do
    refute PipelinePolicy.new(create(:user, :student), @record).manage_pipeline?
  end
end
