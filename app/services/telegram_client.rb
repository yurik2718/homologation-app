class TelegramClient
  def initialize
    bot_token = Rails.application.credentials.dig(:telegram, :bot_token)
    api_base = "https://api.telegram.org/bot#{bot_token}"
    @conn = Faraday.new(url: api_base) do |f|
      f.request :json
      f.response :json
    end
  end

  def send_message(chat_id, text)
    response = @conn.post("/sendMessage", {
      chat_id: chat_id,
      text: text,
      parse_mode: "HTML"
    })
    Rails.logger.warn("Telegram API error: #{response.body}") unless response.success?
    response
  end
end
