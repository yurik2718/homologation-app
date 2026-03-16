class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :user

  has_many_attached :attachments

  validates :body, presence: true

  after_create_commit :broadcast_message
  after_create_commit :touch_conversation_last_message_at

  def as_json_for_cable
    { id: id, body: body, createdAt: created_at.iso8601,
      user: { id: user.id, name: user.name, avatarUrl: user.avatar_url },
      attachments: attachments.map { |a| { id: a.id, filename: a.filename.to_s } } }
  end

  private

  def broadcast_message
    ConversationChannel.broadcast_to(conversation, as_json_for_cable)
  end

  def touch_conversation_last_message_at
    conversation.update_columns(last_message_at: created_at)
  end
end
