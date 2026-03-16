require "test_helper"

class TelegramControllerTest < ActionDispatch::IntegrationTest
  VALID_SECRET = "test_webhook_secret_123"

  setup do
    ENV["TELEGRAM_WEBHOOK_SECRET"] = VALID_SECRET
    WebMock.stub_request(:post, /api\.telegram\.org/).to_return(
      status: 200, body: '{"ok":true}', headers: { "Content-Type" => "application/json" }
    )
  end

  teardown do
    ENV.delete("TELEGRAM_WEBHOOK_SECRET")
    WebMock.reset!
  end

  test "webhook links telegram to user" do
    user = users(:student_ana)
    user.update!(telegram_link_token: "abc123")

    post "/telegram/webhook",
      params: { message: { text: "/start abc123", chat: { id: 999 } } }.to_json,
      headers: {
        "Content-Type" => "application/json",
        "X-Telegram-Bot-Api-Secret-Token" => VALID_SECRET
      }

    assert_response :ok
    assert_equal "999", user.reload.telegram_chat_id
    assert user.notification_telegram?
    assert_nil user.reload.telegram_link_token
  end

  test "webhook rejects invalid secret" do
    post "/telegram/webhook",
      params: { message: { text: "/start abc", chat: { id: 1 } } }.to_json,
      headers: {
        "Content-Type" => "application/json",
        "X-Telegram-Bot-Api-Secret-Token" => "wrong_secret"
      }

    assert_response :forbidden
  end

  test "webhook with unknown token does not crash" do
    post "/telegram/webhook",
      params: { message: { text: "/start unknown_token", chat: { id: 999 } } }.to_json,
      headers: {
        "Content-Type" => "application/json",
        "X-Telegram-Bot-Api-Secret-Token" => VALID_SECRET
      }

    assert_response :ok
  end
end
