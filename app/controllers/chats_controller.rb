# frozen_string_literal: true

class ChatsController < InertiaController
  include ConversationSerializer

  LIST_INCLUDES = [
    :homologation_request, :teacher_student_link,
    :conversation_participants, :participants,
    teacher_student_link: [ :teacher, :student ],
    latest_message: :user
  ].freeze

  DETAIL_INCLUDES = [
    :homologation_request, :teacher_student_link,
    :conversation_participants, :participants,
    teacher_student_link: [ :teacher, :student ],
    latest_message: :user,
    messages: :user,
    homologation_request: :user
  ].freeze

  def index
    authorize :chats
    conversations = list_conversations

    render inertia: "chats/Index", props: {
      conversations: serialize_list(conversations)
    }
  end

  def show
    @conversation = policy_scope(Conversation, policy_scope_class: ChatsPolicy::Scope)
      .includes(*DETAIL_INCLUDES)
      .find(params[:id])
    authorize @conversation, :show?

    # Mark conversation as read for current user (create participant if admin viewing for the first time)
    participant = @conversation.conversation_participants.find_or_create_by!(user: current_user)
    participant.update_columns(last_read_at: Time.current)

    conversations = list_conversations

    render inertia: "chats/Index", props: {
      conversations: serialize_list(conversations),
      selectedConversation: chat_detail_json(@conversation)
    }
  end

  private

  def list_conversations
    policy_scope(Conversation, policy_scope_class: ChatsPolicy::Scope)
      .includes(LIST_INCLUDES)
      .order(last_message_at: :desc)
      .to_a
  end

  def serialize_list(conversations)
    counts = unread_counts_for(conversations, current_user)
    conversations.map { |c| conversation_list_json(c, current_user: current_user, unread_count: counts[c.id] || 0) }
  end

  def chat_detail_json(c)
    base = conversation_detail_json(c, current_user: current_user)

    if c.homologation_request_id?
      r = c.homologation_request
      base[:context] = {
        type: "request",
        requestId: r.id,
        subject: r.subject,
        serviceType: r.service_type,
        university: r.university,
        status: r.status,
        paymentAmount: r.payment_amount&.to_f,
        amoCrmLeadId: r.amo_crm_lead_id,
        amoCrmSyncedAt: r.amo_crm_synced_at&.iso8601,
        amoCrmSyncError: r.amo_crm_sync_error
      }
    else
      ts = c.teacher_student_link
      base[:context] = {
        type: "teacher_student",
        teacherName: ts&.teacher&.name,
        studentName: ts&.student&.name
      }
    end

    base
  end
end
