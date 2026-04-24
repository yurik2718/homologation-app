class NotificationJob < ApplicationJob
  queue_as :default

  CHAT_DIGEST_DELAY = 10.minutes

  # Title keys that warrant a Telegram ping. Everything else stays in-app +
  # email only — so Telegram carries time- or money-critical events, not
  # informational updates. Email is not gated here (the user toggles it
  # globally in settings); priority only silences the loudest channel.
  URGENT_TITLE_KEYS = %w[
    notifications.payment_confirmed
    notifications.lesson_scheduled
    notifications.lesson_reminder
    notifications.lesson_cancelled
  ].to_set.freeze

  # Delivers a notification (in-app + real-time + email + telegram) in the
  # recipient's locale. Text is rendered here, not at the call site, so that
  # e.g. an admin acting in Spanish can notify a student in English without
  # the message getting frozen into the wrong language.
  #
  # Params that are themselves i18n keys (e.g. localized request statuses)
  # can be passed as `{ i18n: "some.key" }` and will be resolved in the
  # recipient's locale before interpolation.
  def perform(user_id:, title_key:, title_params: {}, body_key: nil, body_params: {}, notifiable:)
    user = User.find(user_id)

    I18n.with_locale(user.locale) do
      title = render(title_key, title_params)
      body  = body_key.present? ? render(body_key, body_params) : nil

      notification = Notification.create!(
        user_id: user_id, title: title, body: body, notifiable: notifiable
      )

      NotificationChannel.broadcast_to(user, {
        id: notification.id, title: title, body: body,
        createdAt: notification.created_at.iso8601,
        unreadCount: user.notifications.unread.count
      })

      deliver_email(user, notification, notifiable)
      deliver_telegram(user, title, body, notifiable) if URGENT_TITLE_KEYS.include?(title_key)
    end
  end

  private

  def render(key, params)
    resolved = params.transform_values do |v|
      v.is_a?(Hash) && v[:i18n].present? ? I18n.t(v[:i18n]) : v
    end
    I18n.t(key, **resolved.symbolize_keys)
  end

  def deliver_email(user, notification, notifiable)
    return unless user.notification_email?

    if notifiable.is_a?(Message)
      ChatEmailDigestJob.set(wait: CHAT_DIGEST_DELAY)
        .perform_later(user.id, notifiable.conversation_id)
    else
      NotificationMailer.notify(notification).deliver_later
    end
  end

  def deliver_telegram(user, title, body, notifiable)
    return unless user.notification_telegram? && user.telegram_chat_id.present?
    return if notifiable.is_a?(Message) # chats are covered by the email digest

    TelegramClient.new.send_message(
      user.telegram_chat_id,
      "<b>#{title}</b>\n#{body}"
    )
  end
end
