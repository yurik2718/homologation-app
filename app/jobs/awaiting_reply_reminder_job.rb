class AwaitingReplyReminderJob < ApplicationJob
  queue_as :default

  STALE_THRESHOLD = 48.hours

  # Nudges the student when their request has been sitting in awaiting_reply
  # for 48h+. Stamp-then-enqueue keeps it to one ping per awaiting_reply
  # cycle: if the status moves elsewhere and back, status_changed_at advances
  # past the stamp, re-qualifying the request.
  def perform
    HomologationRequest.kept
      .where(status: "awaiting_reply")
      .where("status_changed_at < ?", STALE_THRESHOLD.ago)
      .where("awaiting_reply_reminded_at IS NULL OR awaiting_reply_reminded_at < status_changed_at")
      .find_each do |request|
        request.update_columns(awaiting_reply_reminded_at: Time.current)
        NotificationJob.perform_later(
          user_id: request.user_id,
          title_key: "notifications.awaiting_reply_reminder",
          title_params: { subject: request.subject },
          notifiable: request
        )
      end
  end
end
