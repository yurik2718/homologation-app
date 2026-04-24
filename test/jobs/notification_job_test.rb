require "test_helper"
require "webmock/minitest"

class NotificationJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper

  setup do
    WebMock.disable_net_connect!
    WebMock.stub_request(:post, /api\.telegram\.org/).to_return(
      status: 200, body: '{"ok":true}', headers: { "Content-Type" => "application/json" }
    )
    @student = create(:user, :student)
    @request = create(:homologation_request, :submitted, user: @student)
  end

  teardown do
    WebMock.allow_net_connect!
    WebMock.reset!
  end

  test "creates notification record with rendered title" do
    assert_difference "Notification.count", 1 do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.new_request",
        title_params: { name: "Alice" },
        notifiable: @request
      )
    end
    assert_equal "Nueva solicitud de Alice", Notification.last.title
  end

  test "renders title in recipient's locale regardless of current locale" do
    @student.update!(locale: "en")

    I18n.with_locale(:es) do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.new_request",
        title_params: { name: "Alice" },
        notifiable: @request
      )
    end

    assert_equal "New request from Alice", Notification.last.title
  end

  test "resolves nested i18n params in recipient's locale" do
    @student.update!(locale: "en")

    NotificationJob.perform_now(
      user_id: @student.id,
      title_key: "notifications.status_changed",
      title_params: { status: { i18n: "requests.status.in_review" } },
      notifiable: @request
    )

    title = Notification.last.title
    assert_includes title, I18n.t("requests.status.in_review", locale: :en)
    assert_no_match(/in_review/, title)
  end

  test "renders optional body when body_key given" do
    NotificationJob.perform_now(
      user_id: @student.id,
      title_key: "notifications.lesson_reminder",
      body_key: "notifications.lesson_starts_soon",
      body_params: { time: "15:00" },
      notifiable: @request
    )
    n = Notification.last
    assert_equal I18n.t("notifications.lesson_reminder", locale: @student.locale), n.title
    assert_includes n.body, "15:00"
  end

  test "sends telegram for urgent types when user has it enabled" do
    @student.update!(telegram_chat_id: "123456", notification_telegram: true)

    NotificationJob.perform_now(
      user_id: @student.id,
      title_key: "notifications.payment_confirmed",
      title_params: { amount: 100, subject: "Degree" },
      notifiable: @request
    )

    assert_requested :post, /api\.telegram\.org/
  end

  test "does not send telegram when user has it disabled" do
    @student.update!(telegram_chat_id: nil, notification_telegram: false)

    NotificationJob.perform_now(
      user_id: @student.id,
      title_key: "notifications.payment_confirmed",
      title_params: { amount: 100, subject: "Degree" },
      notifiable: @request
    )

    assert_not_requested :post, /api\.telegram\.org/
  end

  test "does not send telegram for non-urgent types even with telegram enabled" do
    @student.update!(telegram_chat_id: "123456", notification_telegram: true)

    NotificationJob.perform_now(
      user_id: @student.id,
      title_key: "notifications.status_changed",
      title_params: { status: { i18n: "requests.status.in_review" } },
      notifiable: @request
    )

    assert_not_requested :post, /api\.telegram\.org/
  end

  test "non-urgent type still creates in-app notification" do
    @student.update!(telegram_chat_id: "123456", notification_telegram: true)

    assert_difference "Notification.count", 1 do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.status_changed",
        title_params: { status: { i18n: "requests.status.in_review" } },
        notifiable: @request
      )
    end
  end

  test "sends immediate email for non-message notifiable" do
    @student.update!(notification_email: true)

    assert_enqueued_emails 1 do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.new_request",
        title_params: { name: "Bob" },
        notifiable: @request
      )
    end
  end

  test "enqueues digest job instead of immediate email for message notifiable" do
    @student.update!(notification_email: true)
    conversation = @request.conversation
    message = create(:message, conversation: conversation, user: @student)

    assert_enqueued_with(job: ChatEmailDigestJob) do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.new_message",
        title_params: { name: "Bob" },
        notifiable: message
      )
    end
  end

  test "does not send email when user has it disabled" do
    @student.update!(notification_email: false)

    assert_enqueued_emails 0 do
      NotificationJob.perform_now(
        user_id: @student.id,
        title_key: "notifications.new_request",
        title_params: { name: "Bob" },
        notifiable: @request
      )
    end
  end
end
