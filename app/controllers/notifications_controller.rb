class NotificationsController < InertiaController
  # Bounds the payload sent to the client. Older notifications are still
  # accessible in the DB; surface pagination if this ever proves limiting.
  INDEX_LIMIT = 200

  def index
    authorize Notification
    notifications = current_user.notifications.order(created_at: :desc).limit(INDEX_LIMIT)
    render inertia: "notifications/Index", props: {
      notifications: notifications.map { |n| notification_json(n) }
    }
  end

  def update
    @notification = Notification.find(params[:id])
    authorize @notification
    @notification.mark_as_read!
    redirect_to redirect_url_for(@notification), allow_other_host: false
  end

  def mark_all_read
    authorize Notification, :mark_all_read?
    current_user.notifications.unread.update_all(read_at: Time.current)
    redirect_back fallback_location: notifications_path
  end

  private

  def notification_json(n)
    { id: n.id, title: n.title, body: n.body,
      readAt: n.read_at&.iso8601, createdAt: n.created_at.iso8601,
      notifiableType: n.notifiable_type, notifiableId: n.notifiable_id }
  end

  # Single source of truth for where a notification takes the user. The
  # frontend delegates to PATCH /notifications/:id so routing logic does
  # not diverge between client and server.
  def redirect_url_for(notification)
    case notification.notifiable_type
    when "HomologationRequest"
      # Request may have been soft-deleted since the notification was sent.
      HomologationRequest.kept.exists?(notification.notifiable_id) ?
        homologation_request_path(notification.notifiable_id) : notifications_path
    when "Lesson"
      Lesson.exists?(notification.notifiable_id) ?
        lesson_path(notification.notifiable_id) : notifications_path
    when "Message"
      message_notification_url(notification.notifiable_id)
    when "TeacherStudent"
      teacher_student_notification_url(notification.notifiable_id)
    when "User"
      # Admin-scoped destinations (e.g. deletion requests land on the user's edit page).
      current_user.super_admin? ? edit_admin_user_path(notification.notifiable_id) : notifications_path
    else
      notifications_path
    end
  end

  def message_notification_url(message_id)
    message = Message.find_by(id: message_id)
    message ? conversation_link(message.conversation_id) : notifications_path
  end

  # A TeacherStudent pairing has exactly one conversation; we route everyone to it
  # so the first action is "say hi". If the pairing (or conversation) has been
  # torn down, fall back gracefully.
  def teacher_student_notification_url(teacher_student_id)
    conversation = Conversation.find_by(teacher_student_id: teacher_student_id)
    conversation ? conversation_link(conversation.id) : notifications_path
  end

  # Admins view chats through /chats (oversight surface); everyone else uses /conversations.
  def conversation_link(conversation_id)
    current_user.super_admin? ? chat_path(conversation_id) : conversation_path(conversation_id)
  end
end
