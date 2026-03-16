require "test_helper"
require "webmock/minitest"

class NotificationJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper

  setup do
    WebMock.disable_net_connect!
    WebMock.stub_request(:post, /api\.telegram\.org/).to_return(
      status: 200, body: '{"ok":true}', headers: { "Content-Type" => "application/json" }
    )
  end

  teardown do
    WebMock.allow_net_connect!
    WebMock.reset!
  end
  test "creates notification record" do
    assert_difference "Notification.count", 1 do
      NotificationJob.perform_now(
        user_id: users(:student_ana).id,
        title: "Test notification",
        notifiable: homologation_requests(:ana_equivalencia)
      )
    end
  end

  test "sends telegram when user has it enabled" do
    user = users(:student_ana)
    user.update!(telegram_chat_id: "123456", notification_telegram: true)

    NotificationJob.perform_now(
      user_id: user.id,
      title: "Test",
      notifiable: homologation_requests(:ana_equivalencia)
    )

    assert_requested :post, /api\.telegram\.org.*\/sendMessage|api\.telegram\.org\/sendMessage/
  end

  test "does not send telegram when user has it disabled" do
    user = users(:student_ana)
    user.update!(telegram_chat_id: nil, notification_telegram: false)

    NotificationJob.perform_now(
      user_id: user.id,
      title: "Test",
      notifiable: homologation_requests(:ana_equivalencia)
    )

    assert_not_requested :post, /api\.telegram\.org/
  end

  test "sends email when user has it enabled" do
    user = users(:student_ana)
    user.update!(notification_email: true)

    assert_enqueued_emails 1 do
      NotificationJob.perform_now(
        user_id: user.id,
        title: "Test",
        notifiable: homologation_requests(:ana_equivalencia)
      )
    end
  end

  test "does not send email when user has it disabled" do
    user = users(:student_ana)
    user.update!(notification_email: false)

    assert_enqueued_emails 0 do
      NotificationJob.perform_now(
        user_id: user.id,
        title: "Test",
        notifiable: homologation_requests(:ana_equivalencia)
      )
    end
  end
end
