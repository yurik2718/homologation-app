# frozen_string_literal: true

class MessagesController < InertiaController
  def create
    @conversation = find_conversation
    @message = @conversation.messages.build(user: current_user, body: params[:body])
    @message.attachments.attach(params[:attachments]) if params[:attachments].present?
    authorize @message

    if @message.save
      notify_other_participants(@conversation, @message)
      redirect_back fallback_location: root_path
    else
      redirect_back fallback_location: root_path, alert: @message.errors.full_messages.first
    end
  end

  private

  def find_conversation
    if params[:homologation_request_id].present?
      HomologationRequest.kept.find(params[:homologation_request_id]).conversation
    else
      Conversation.find(params[:conversation_id])
    end
  end

  def notify_other_participants(conversation, message)
    conversation.participants.where.not(id: current_user.id).find_each do |participant|
      NotificationJob.perform_later(
        user_id: participant.id,
        title_key: "notifications.new_message",
        title_params: { name: current_user.name },
        notifiable: message
      )
    end
  end
end
