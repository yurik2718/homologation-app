class NotificationJob < ApplicationJob
  queue_as :default

  def perform(user_id:, title:, body: nil, notifiable:)
    user = User.find(user_id)

    # 1. Always create in-app notification
    notification = Notification.create!(
      user_id: user_id, title: title, body: body, notifiable: notifiable
    )

    # 2. Always broadcast to Action Cable (real-time bell update)
    NotificationChannel.broadcast_to(user, {
      id: notification.id, title: title, body: body,
      createdAt: notification.created_at.iso8601,
      unreadCount: user.notifications.unread.count
    })

    # 3. Email (if user has it enabled — default: true)
    if user.notification_email?
      NotificationMailer.notify(notification).deliver_later
    end

    # 4. Telegram (if user connected and enabled)
    if user.notification_telegram? && user.telegram_chat_id.present?
      TelegramClient.new.send_message(
        user.telegram_chat_id,
        "<b>#{title}</b>\n#{body}"
      )
    end
  end
end
