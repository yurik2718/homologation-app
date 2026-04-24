require "test_helper"

class ConversationSerializerTest < ActiveSupport::TestCase
  include ConversationSerializer

  setup do
    @student = create(:user, :student)
    @coordinator = create(:user, :coordinator)
    @request = create(:homologation_request, :submitted, :with_conversation, user: @student)
    @conversation = @request.conversation
    @conversation.add_participant!(@coordinator)
  end

  # --- conversation_list_json ---

  test "conversation_list_json returns expected keys" do
    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 0)
    assert_equal @conversation.id, json[:id]
    assert_equal "request", json[:type]
    assert_equal @conversation.title, json[:title]
    assert json.key?(:otherUser)
    assert json.key?(:lastMessage)
    assert json.key?(:unread)
    assert json.key?(:unreadCount)
    assert json.key?(:lastMessageAt)
  end

  test "conversation_list_json shows other user (not current_user)" do
    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 0)
    assert_equal @student.id, json[:otherUser][:id]
    assert_equal @student.name, json[:otherUser][:name]
  end

  test "conversation_list_json with no messages returns nil lastMessage" do
    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 0)
    assert_nil json[:lastMessage]
  end

  test "conversation_list_json with message truncates body to 80 chars" do
    long_body = "A" * 200
    create(:message, conversation: @conversation, user: @student, body: long_body)
    @conversation.reload

    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 0)
    assert json[:lastMessage][:body].length <= 80
    assert json[:lastMessage][:createdAt].present?
  end

  test "conversation_list_json type is teacher_student for non-request conversations" do
    teacher = create(:user, :teacher)
    ts = create(:teacher_student, teacher: teacher, student: @student, assigned_by: @coordinator.id)
    conv = create(:conversation, :for_teacher_student, teacher_student_link: ts)
    conv.add_participant!(teacher)
    conv.add_participant!(@student)

    json = conversation_list_json(conv, current_user: @student, unread_count: 0)
    assert_equal "teacher_student", json[:type]
  end

  test "conversation_list_json with no other participant returns nil otherUser" do
    # Remove all participants except current_user
    @conversation.conversation_participants.where.not(user: @coordinator).destroy_all
    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 0)
    assert_nil json[:otherUser]
  end

  test "conversation_list_json surfaces the passed unread_count verbatim" do
    json = conversation_list_json(@conversation, current_user: @coordinator, unread_count: 5)
    assert_equal 5, json[:unreadCount]
  end

  # --- conversation_detail_json ---

  test "conversation_detail_json returns expected keys" do
    json = conversation_detail_json(@conversation, current_user: @coordinator)
    assert_equal @conversation.id, json[:id]
    assert_equal "request", json[:type]
    assert_equal @conversation.title, json[:title]
    assert json.key?(:otherUser)
    assert json.key?(:messages)
  end

  test "conversation_detail_json includes messages sorted by created_at" do
    msg1 = create(:message, conversation: @conversation, user: @student, body: "First")
    msg2 = create(:message, conversation: @conversation, user: @coordinator, body: "Second")
    # Ensure ordering
    msg1.update_columns(created_at: 2.minutes.ago)
    msg2.update_columns(created_at: 1.minute.ago)
    @conversation.reload

    json = conversation_detail_json(@conversation, current_user: @coordinator)
    assert_equal 2, json[:messages].length
    assert json[:messages].first[:createdAt] < json[:messages].last[:createdAt]
  end

  test "conversation_detail_json with no messages returns empty array" do
    json = conversation_detail_json(@conversation, current_user: @coordinator)
    assert_equal [], json[:messages]
  end

  # --- conversation_messages_json ---

  test "conversation_messages_json returns id and messages" do
    create(:message, conversation: @conversation, user: @student, body: "Hello")
    @conversation.reload

    json = conversation_messages_json(@conversation)
    assert_equal @conversation.id, json[:id]
    assert_equal 1, json[:messages].length
  end

  test "conversation_messages_json with no messages returns empty array" do
    json = conversation_messages_json(@conversation)
    assert_equal @conversation.id, json[:id]
    assert_equal [], json[:messages]
  end
end
