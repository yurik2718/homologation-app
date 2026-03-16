require "test_helper"

class LessonReminderJobTest < ActiveJob::TestCase
  test "sends reminder for lessons starting in ~1 hour" do
    lesson = lessons(:ivan_ana_lesson)
    lesson.update!(scheduled_at: 60.minutes.from_now, status: "scheduled")

    assert_difference "Notification.count", 2 do  # teacher + student
      perform_enqueued_jobs { LessonReminderJob.perform_now }
    end
  end

  test "does not send reminder for cancelled lessons" do
    lesson = lessons(:ivan_ana_lesson)
    lesson.update!(scheduled_at: 60.minutes.from_now, status: "cancelled")

    assert_no_difference "Notification.count" do
      LessonReminderJob.perform_now
    end
  end

  test "does not send reminder for lessons outside the 1-hour window" do
    lesson = lessons(:ivan_ana_lesson)
    lesson.update!(scheduled_at: 3.hours.from_now, status: "scheduled")

    assert_no_difference "Notification.count" do
      LessonReminderJob.perform_now
    end
  end
end
