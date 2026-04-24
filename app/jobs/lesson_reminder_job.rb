class LessonReminderJob < ApplicationJob
  queue_as :default

  # Runs every 5 minutes (see config/recurring.yml). Each run sweeps two
  # windows: ~1 hour out (urgent — reaches Telegram) and ~24 hours out
  # (heads-up — email/in-app only). The reminded_*_at stamps guarantee a
  # lesson is reminded exactly once per tier even though the 10-min window
  # overlaps across the 5-min cadence.
  def perform
    notify_for_window(
      55.minutes.from_now..65.minutes.from_now,
      stamp_column: :reminded_1h_at,
      title_key:    "notifications.lesson_reminder",
      body_key:     "notifications.lesson_starts_soon",
      body_params:  ->(lesson) { { time: lesson.scheduled_at.strftime("%H:%M") } }
    )

    notify_for_window(
      23.hours.from_now + 55.minutes..24.hours.from_now + 5.minutes,
      stamp_column: :reminded_24h_at,
      title_key:    "notifications.lesson_reminder_24h",
      body_key:     "notifications.lesson_starts_tomorrow",
      body_params:  ->(lesson) { { time: lesson.scheduled_at.strftime("%d/%m %H:%M") } }
    )
  end

  private

  def notify_for_window(range, stamp_column:, title_key:, body_key:, body_params:)
    Lesson.where(status: "scheduled")
          .where(scheduled_at: range)
          .where(stamp_column => nil)
          .find_each do |lesson|
      # Stamp first: if enqueue somehow fires twice for the same record, the
      # second pass sees a non-null stamp and skips. Worst case: a stamp is
      # set but the enqueue fails — the lesson silently loses that reminder.
      # That's better than the alternative (duplicate pings).
      lesson.update_column(stamp_column, Time.current)

      [ lesson.teacher_id, lesson.student_id ].each do |user_id|
        NotificationJob.perform_later(
          user_id: user_id,
          title_key: title_key,
          body_key:  body_key,
          body_params: body_params.call(lesson),
          notifiable: lesson
        )
      end
    end
  end
end
