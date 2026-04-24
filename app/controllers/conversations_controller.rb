# frozen_string_literal: true

class ConversationsController < InertiaController
  include ConversationSerializer

  def index
    authorize :conversation, :index?
    @conversations = current_user_conversations
      .includes(:conversation_participants, :participants,
                :homologation_request, teacher_student_link: [ :teacher, :student ],
                latest_message: :user)
      .order(last_message_at: :desc)
      .to_a

    counts = unread_counts_for(@conversations, current_user)

    render inertia: "chat/Index", props: {
      conversations: @conversations.map { |c|
        conversation_list_json(c, current_user: current_user, unread_count: counts[c.id] || 0)
      }
    }
  end

  def show
    @conversation = Conversation
      .includes(:conversation_participants, :participants, :homologation_request,
                teacher_student_link: [ :teacher, :student ], messages: :user)
      .find(params[:id])
    authorize @conversation, :show?

    # Mark as read
    participant = @conversation.conversation_participants.find_by(user: current_user)
    participant&.update_columns(last_read_at: Time.current)

    render inertia: "chat/Show", props: {
      conversation: conversation_detail_json(@conversation, current_user: current_user)
    }
  end

  private

  def current_user_conversations
    Conversation
      .joins(:conversation_participants)
      .where(conversation_participants: { user_id: current_user.id })
  end
end
