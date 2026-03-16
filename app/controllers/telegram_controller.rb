class TelegramController < ApplicationController
  allow_unauthenticated_access
  skip_before_action :verify_authenticity_token, raise: false
  skip_after_action :verify_authorized, raise: false

  def webhook
    secret = request.headers["X-Telegram-Bot-Api-Secret-Token"]
    expected = ENV["TELEGRAM_WEBHOOK_SECRET"].presence ||
               Rails.application.credentials.dig(:telegram, :webhook_secret)

    unless expected.present? && secret == expected
      return head :forbidden
    end

    data = JSON.parse(request.body.read)
    handle_message(data["message"]) if data["message"]
    head :ok
  end

  private

  def handle_message(message)
    text = message["text"]
    chat_id = message["chat"]["id"]

    if text&.start_with?("/start")
      user_token = text.split(" ")[1]
      user = User.find_by(telegram_link_token: user_token)
      if user
        user.update!(telegram_chat_id: chat_id.to_s, notification_telegram: true, telegram_link_token: nil)
        TelegramClient.new.send_message(chat_id, "✅ ¡Telegram conectado! Recibirás notificaciones aquí.\n\n✅ Telegram connected! You will receive notifications here.\n\n✅ Telegram подключён! Уведомления будут приходить сюда.")
      else
        TelegramClient.new.send_message(chat_id, "❌ Invalid link. Use the button in your profile / Usa el botón en tu perfil.")
      end
    end
  end
end
