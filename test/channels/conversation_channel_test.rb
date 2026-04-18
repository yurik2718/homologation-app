require "test_helper"

class ConversationChannelTest < ActionCable::Channel::TestCase
  # ConversationChannel streams chat messages — must NEVER stream a conversation
  # to anyone who isn't a participant. A failure here = clients can read other
  # clients' chats.

  setup do
    @student = create(:user, :student)
    @other_student = create(:user, :student)
    @admin = create(:user, :super_admin)
    @request_record = create(:homologation_request, :submitted, :with_conversation, user: @student)
    @conversation = @request_record.conversation
  end

  test "participant subscribes successfully and streams for the conversation" do
    stub_connection current_user: @student

    subscribe id: @conversation.id

    assert subscription.confirmed?
    assert_has_stream_for @conversation
  end

  test "non-participant is rejected" do
    stub_connection current_user: @other_student

    subscribe id: @conversation.id

    assert subscription.rejected?
  end

  test "subscription to a nonexistent conversation raises RecordNotFound" do
    stub_connection current_user: @student

    assert_raises(ActiveRecord::RecordNotFound) do
      subscribe id: 999_999
    end
  end

  test "admin added as participant can subscribe" do
    @conversation.conversation_participants.create!(user: @admin)
    stub_connection current_user: @admin

    subscribe id: @conversation.id

    assert subscription.confirmed?
    assert_has_stream_for @conversation
  end

  test "admin NOT a participant cannot subscribe (no implicit admin bypass)" do
    stub_connection current_user: @admin

    subscribe id: @conversation.id

    assert subscription.rejected?,
      "admins must be explicit participants to see a chat — no silent bypass"
  end
end
