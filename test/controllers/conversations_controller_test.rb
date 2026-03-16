require "test_helper"

class ConversationsControllerTest < ActionDispatch::IntegrationTest
  test "student sees own conversations" do
    sign_in users(:student_ana)
    get conversations_path
    assert_response :ok
    assert_equal "chat/Index", inertia.component
  end

  test "teacher sees own conversations" do
    sign_in users(:teacher_ivan)
    get conversations_path
    assert_response :ok
    assert_equal "chat/Index", inertia.component
  end

  test "student can view own conversation" do
    sign_in users(:student_ana)
    get conversation_path(conversations(:ana_equivalencia_conversation))
    assert_response :ok
    assert_equal "chat/Show", inertia.component
  end

  test "student cannot view unrelated conversation" do
    sign_in users(:student_pedro)
    get conversation_path(conversations(:ana_equivalencia_conversation))
    assert_response :forbidden
  end

  test "coordinator can view any conversation" do
    sign_in users(:coordinator_maria)
    get conversation_path(conversations(:ana_equivalencia_conversation))
    assert_response :ok
  end

  test "show marks conversation as read" do
    sign_in users(:student_ana)
    participant = conversation_participants(:ana_in_equivalencia_conversation)
    assert_nil participant.last_read_at

    get conversation_path(conversations(:ana_equivalencia_conversation))
    assert_not_nil participant.reload.last_read_at
  end
end
