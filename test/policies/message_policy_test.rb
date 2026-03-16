require "test_helper"

class MessagePolicyTest < ActiveSupport::TestCase
  setup do
    @ana = users(:student_ana)
    @pedro = users(:student_pedro)
    @maria = users(:coordinator_maria)
    @ivan = users(:teacher_ivan)
    @request_conversation = conversations(:ana_equivalencia_conversation)
    @teacher_conversation = conversations(:ivan_ana_conversation)
  end

  # === Request conversations ===

  test "student can send message in own request conversation" do
    msg = @request_conversation.messages.build(user: @ana, body: "test")
    assert MessagePolicy.new(@ana, msg).create?
  end

  test "student cannot send message in another student's request conversation" do
    msg = @request_conversation.messages.build(user: @pedro, body: "test")
    refute MessagePolicy.new(@pedro, msg).create?
  end

  test "coordinator can send message in any request conversation" do
    msg = @request_conversation.messages.build(user: @maria, body: "test")
    assert MessagePolicy.new(@maria, msg).create?
  end

  # === Teacher-student conversations ===

  test "teacher can send message to assigned student" do
    msg = @teacher_conversation.messages.build(user: @ivan, body: "test")
    assert MessagePolicy.new(@ivan, msg).create?
  end

  test "assigned student can send message to teacher" do
    msg = @teacher_conversation.messages.build(user: @ana, body: "test")
    assert MessagePolicy.new(@ana, msg).create?
  end

  test "unrelated student cannot send message in teacher-student conversation" do
    msg = @teacher_conversation.messages.build(user: @pedro, body: "test")
    refute MessagePolicy.new(@pedro, msg).create?
  end

  test "coordinator can send message in teacher-student conversation" do
    msg = @teacher_conversation.messages.build(user: @maria, body: "test")
    assert MessagePolicy.new(@maria, msg).create?
  end
end
