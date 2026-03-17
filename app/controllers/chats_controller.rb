# frozen_string_literal: true

class ChatsController < InertiaController
  LIST_INCLUDES = [
    :homologation_request, :teacher_student_link,
    :conversation_participants,
    teacher_student_link: [ :teacher, :student ],
    latest_message: :user
  ].freeze

  DETAIL_INCLUDES = [
    :homologation_request, :teacher_student_link,
    :conversation_participants,
    teacher_student_link: [ :teacher, :student ],
    latest_message: :user,
    messages: :user,
    homologation_request: :user
  ].freeze

  def index
    authorize :chats

    conversations = policy_scope(Conversation, policy_scope_class: ChatsPolicy::Scope)
      .includes(LIST_INCLUDES)
      .order(last_message_at: :desc)

    render inertia: "chats/Index", props: {
      conversations: conversations.map { |c| chat_conversation_json(c) }
    }
  end

  def show
    @conversation = policy_scope(Conversation, policy_scope_class: ChatsPolicy::Scope)
      .includes(*DETAIL_INCLUDES)
      .find(params[:id])
    authorize @conversation, :show?

    conversations = policy_scope(Conversation, policy_scope_class: ChatsPolicy::Scope)
      .includes(LIST_INCLUDES)
      .order(last_message_at: :desc)

    render inertia: "chats/Index", props: {
      conversations: conversations.map { |c| chat_conversation_json(c) },
      selectedConversation: chat_conversation_detail_json(@conversation)
    }
  end

  private

  def chat_conversation_json(c)
    last_msg = c.latest_message
    {
      id: c.id,
      type: c.homologation_request_id.present? ? "request" : "teacher_student",
      title: c.title,
      lastMessage: last_msg ? { body: last_msg.body.truncate(80), createdAt: last_msg.created_at.iso8601 } : nil,
      unread: c.unread_for?(current_user),
      lastMessageAt: c.last_message_at&.iso8601
    }
  end

  def chat_conversation_detail_json(c)
    base = chat_conversation_json(c)
    base[:messages] = c.messages.sort_by(&:created_at).map(&:as_json_for_cable)

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
