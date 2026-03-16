# frozen_string_literal: true

class ConversationsController < InertiaController
  def index
    authorize :conversation, :index?
    @conversations = current_user_conversations
      .includes(:conversation_participants, :participants,
                :homologation_request, teacher_student_link: [ :teacher, :student ],
                messages: :user)
      .order(last_message_at: :desc)

    render inertia: "chat/Index", props: {
      conversations: @conversations.map { |c| conversation_list_json(c) }
    }
  end

  def show
    @conversation = Conversation
      .includes(:conversation_participants, :homologation_request,
                teacher_student_link: [ :teacher, :student ], messages: :user)
      .find(params[:id])
    authorize @conversation, :show?

    # Mark as read
    participant = @conversation.conversation_participants.find_by(user: current_user)
    participant&.update_columns(last_read_at: Time.current)

    render inertia: "chat/Show", props: {
      conversation: conversation_detail_json(@conversation)
    }
  end

  private

  def current_user_conversations
    Conversation
      .joins(:conversation_participants)
      .where(conversation_participants: { user_id: current_user.id })
  end

  def conversation_list_json(c)
    last_msg = c.messages.max_by(&:created_at)
    other = c.participants.reject { |p| p.id == current_user.id }.first

    {
      id: c.id,
      type: c.homologation_request_id.present? ? "request" : "teacher_student",
      title: conversation_title(c),
      otherUser: other ? { id: other.id, name: other.name, avatarUrl: other.avatar_url } : nil,
      lastMessage: last_msg ? { body: last_msg.body.truncate(80), createdAt: last_msg.created_at.iso8601 } : nil,
      unread: unread?(c),
      lastMessageAt: c.last_message_at&.iso8601
    }
  end

  def conversation_detail_json(c)
    {
      id: c.id,
      type: c.homologation_request_id.present? ? "request" : "teacher_student",
      title: conversation_title(c),
      messages: c.messages.order(:created_at).map { |m| message_json(m) }
    }
  end

  def message_json(m)
    m.as_json_for_cable
  end

  def conversation_title(c)
    if c.homologation_request_id?
      c.homologation_request&.subject || "Request ##{c.homologation_request_id}"
    else
      ts = c.teacher_student_link
      "#{ts&.teacher&.name} — #{ts&.student&.name}"
    end
  end

  def unread?(c)
    cp = c.conversation_participants.detect { |p| p.user_id == current_user.id }
    return true unless cp&.last_read_at
    c.last_message_at && cp.last_read_at < c.last_message_at
  end
end
