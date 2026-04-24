require "test_helper"

class ChatsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :super_admin)
    @coordinator = create(:user, :coordinator)
    @student = create(:user, :student)
    @teacher = create(:user, :teacher)
    @request = create(:homologation_request, :submitted, :with_conversation, user: @student)
    @conversation = @request.conversation
  end

  test "coordinator cannot access chats" do
    sign_in @coordinator
    get chats_path
    assert_response :forbidden
  end

  test "super_admin can access chats" do
    sign_in @admin
    get chats_path
    assert_response :ok
    assert_equal "chats/Index", inertia.component
  end

  test "student cannot access chats" do
    sign_in @student
    get chats_path
    assert_response :forbidden
  end

  test "teacher cannot access chats" do
    sign_in @teacher
    get chats_path
    assert_response :forbidden
  end

  test "super_admin can view conversation in chats" do
    sign_in @admin
    get chat_path(@conversation)
    assert_response :ok
    assert_equal "chats/Index", inertia.component
  end

  test "chats index includes conversations list" do
    sign_in @admin
    get chats_path
    assert_response :ok
    props = inertia.props
    assert props[:conversations].is_a?(Array)
  end

  # === Unread mark-as-read ===

  test "show creates participant and marks as read when admin is not a participant" do
    sign_in @admin
    # Admin is NOT a participant yet
    assert_nil @conversation.conversation_participants.find_by(user: @admin)

    assert_difference "ConversationParticipant.count", 1 do
      get chat_path(@conversation)
    end

    assert_response :ok
    cp = @conversation.conversation_participants.find_by(user: @admin)
    assert_not_nil cp
    assert_not_nil cp.last_read_at
  end

  test "show marks as read without creating duplicate when admin is already a participant" do
    sign_in @admin
    @conversation.add_participant!(@admin)

    assert_no_difference "ConversationParticipant.count" do
      get chat_path(@conversation)
    end

    assert_response :ok
    cp = @conversation.conversation_participants.find_by(user: @admin)
    assert_not_nil cp.last_read_at
  end

  test "conversation shows unread false in list after admin opens it" do
    sign_in @admin
    # Add a message so conversation has last_message_at
    create(:message, conversation: @conversation, user: @student)
    @conversation.update!(last_message_at: Time.current)

    get chat_path(@conversation)
    assert_response :ok

    props = inertia.props
    opened = props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_not opened[:unread], "Conversation should be marked as read after opening"
  end

  test "conversation shows unread true in list when admin has not opened it" do
    sign_in @admin
    # Add admin as participant with old last_read_at, then add a newer message
    cp = @conversation.add_participant!(@admin)
    cp.update_columns(last_read_at: 1.hour.ago)
    @conversation.update!(last_message_at: Time.current)

    get chats_path
    assert_response :ok

    props = inertia.props
    conv = props[:conversations].find { |c| c[:id] == @conversation.id }
    assert conv[:unread], "Conversation should be unread when last_read_at < last_message_at"
  end

  # === Enriched list props: otherUser, unreadCount, authorIsMe, requestStatus ===

  test "request conversation exposes otherUser pointing to the student" do
    sign_in @admin
    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal @student.id, conv[:otherUser][:id]
    assert_equal @student.name, conv[:otherUser][:name]
    assert conv[:otherUser].key?(:avatarUrl)
  end

  test "conversation list includes unreadCount as a number" do
    sign_in @admin
    cp = @conversation.add_participant!(@admin)
    cp.update_columns(last_read_at: 2.hours.ago)
    create(:message, conversation: @conversation, user: @student, created_at: 30.minutes.ago)
    create(:message, conversation: @conversation, user: @student, created_at: 10.minutes.ago)
    @conversation.update!(last_message_at: 10.minutes.ago)

    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal 2, conv[:unreadCount], "Two unread messages expected"
  end

  test "unreadCount is zero when admin is caught up" do
    sign_in @admin
    create(:message, conversation: @conversation, user: @student)
    @conversation.update!(last_message_at: Time.current)
    # Open it to mark as read
    get chat_path(@conversation)

    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal 0, conv[:unreadCount]
  end

  test "lastMessage.authorIsMe is true when current user sent the last message" do
    sign_in @admin
    create(:message, conversation: @conversation, user: @admin, body: "Hello from admin")
    @conversation.update!(last_message_at: Time.current)

    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal true, conv[:lastMessage][:authorIsMe]
  end

  test "lastMessage.authorIsMe is false when other user sent the last message" do
    sign_in @admin
    create(:message, conversation: @conversation, user: @student, body: "Hi from student")
    @conversation.update!(last_message_at: Time.current)

    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal false, conv[:lastMessage][:authorIsMe]
  end

  test "request conversation exposes requestStatus" do
    expected_status = @request.status # ActionDispatch::IntegrationTest clobbers @request after GET
    sign_in @admin
    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal expected_status, conv[:requestStatus]
  end

  test "teacher_student conversation omits requestStatus" do
    sign_in @admin
    link = create(:teacher_student, teacher: @teacher, student: @student, assigned_by: @admin.id)
    ts_conv = Conversation.create!(teacher_student_link: link)
    ts_conv.add_participant!(@teacher)
    ts_conv.add_participant!(@student)

    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == ts_conv.id }
    assert_nil conv[:requestStatus], "teacher_student conversation should not carry requestStatus"
  end

  test "unreadCount counts every message when admin has no participant row" do
    sign_in @admin
    assert_nil @conversation.conversation_participants.find_by(user: @admin),
      "precondition: admin must not have a participant row"
    create(:message, conversation: @conversation, user: @student)
    create(:message, conversation: @conversation, user: @student)
    @conversation.update!(last_message_at: Time.current)

    get chats_path
    conv = inertia.props[:conversations].find { |c| c[:id] == @conversation.id }
    assert_equal 2, conv[:unreadCount],
      "all messages should count as unread when the viewer has no participant row"
  end
end
