class NotificationsController < InertiaController
  def index
    authorize Notification
    notifications = current_user.notifications.order(created_at: :desc)
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

  def redirect_url_for(notification)
    case notification.notifiable_type
    when "HomologationRequest"
      homologation_request_path(notification.notifiable_id)
    when "Lesson"
      lesson_path(notification.notifiable_id)
    when "Message"
      conversations_path
    else
      notifications_path
    end
  end
end
