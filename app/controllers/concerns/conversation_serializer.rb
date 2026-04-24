# frozen_string_literal: true

module ConversationSerializer
  extend ActiveSupport::Concern

  private

  def conversation_list_json(c, current_user:, unread_count:)
    last_msg = c.latest_message
    other = c.participants.reject { |p| p.id == current_user.id }.first

    {
      id: c.id,
      type: c.homologation_request_id.present? ? "request" : "teacher_student",
      title: c.title,
      otherUser: other ? { id: other.id, name: other.name, avatarUrl: other.avatar_url } : nil,
      lastMessage: last_msg ? {
        body: last_msg.body.truncate(80),
        createdAt: last_msg.created_at.iso8601,
        authorIsMe: last_msg.user_id == current_user.id
      } : nil,
      # `unread` is timestamp-based (last_read_at vs last_message_at) for
      # consistency with existing callers; `unreadCount` counts actual messages.
      unread: c.unread_for?(current_user),
      unreadCount: unread_count,
      lastMessageAt: c.last_message_at&.iso8601,
      requestStatus: c.homologation_request_id.present? ? c.homologation_request&.status : nil
    }
  end

  # Returns { conversation_id => unread_count } in a single grouped SQL query.
  # Users without a participant row count every message as unread — matches the
  # fallback behavior of Conversation#unread_for? for super_admin browsing.
  def unread_counts_for(conversations, user)
    ids = conversations.map(&:id)
    return {} if ids.empty?

    join = ActiveRecord::Base.sanitize_sql_array([
      "LEFT JOIN conversation_participants cp ON cp.conversation_id = messages.conversation_id AND cp.user_id = ?",
      user.id
    ])

    Message
      .joins(join)
      .where(conversation_id: ids)
      .where("cp.last_read_at IS NULL OR messages.created_at > cp.last_read_at")
      .group("messages.conversation_id")
      .count
  end

  def conversation_detail_json(c, current_user:)
    other = c.participants.reject { |p| p.id == current_user.id }.first

    {
      id: c.id,
      type: c.homologation_request_id.present? ? "request" : "teacher_student",
      title: c.title,
      otherUser: other ? { id: other.id, name: other.name, avatarUrl: other.avatar_url } : nil,
      messages: c.messages.sort_by(&:created_at).map(&:as_json_for_cable)
    }
  end

  def conversation_messages_json(c)
    {
      id: c.id,
      messages: c.messages.order(:created_at).map(&:as_json_for_cable)
    }
  end
end
