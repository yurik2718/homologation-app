require "test_helper"

class LessonReminderJobTest < ActiveJob::TestCase
  setup do
    @teacher = create(:user, :teacher)
    @student = create(:user, :student)
    @coordinator = create(:user, :coordinator)
    create(:teacher_profile, user: @teacher)
    create(:teacher_student, teacher: @teacher, student: @student, assigned_by: @coordinator.id)
    @lesson = create(:lesson, teacher: @teacher, student: @student)
  end

  test "sends reminder for lessons starting in ~1 hour" do
    freeze_time do
      @lesson.update!(scheduled_at: 60.minutes.from_now, status: "scheduled")

      assert_difference "Notification.count", 2 do  # teacher + student
        perform_enqueued_jobs { LessonReminderJob.perform_now }
      end
    end
  end

  test "does not send reminder for cancelled lessons" do
    freeze_time do
      @lesson.update!(scheduled_at: 60.minutes.from_now, status: "cancelled")

      assert_no_difference "Notification.count" do
        LessonReminderJob.perform_now
      end
    end
  end

  test "does not send reminder for lessons outside the 1-hour window" do
    freeze_time do
      @lesson.update!(scheduled_at: 3.hours.from_now, status: "scheduled")

      assert_no_difference "Notification.count" do
        LessonReminderJob.perform_now
      end
    end
  end

  test "sends 24h reminder for lessons ~1 day out" do
    freeze_time do
      @lesson.update!(scheduled_at: 24.hours.from_now, status: "scheduled")

      assert_difference "Notification.count", 2 do # teacher + student
        perform_enqueued_jobs { LessonReminderJob.perform_now }
      end

      titles = Notification.last(2).map(&:title).uniq
      assert_equal [ I18n.t("notifications.lesson_reminder_24h", locale: @student.locale) ], titles
    end
  end

  test "does not send 24h reminder for a lesson 3 hours out" do
    freeze_time do
      @lesson.update!(scheduled_at: 3.hours.from_now, status: "scheduled")

      assert_no_difference "Notification.count" do
        perform_enqueued_jobs { LessonReminderJob.perform_now }
      end
    end
  end

  test "1h reminder fires once across two overlapping job runs" do
    # The 10-minute window with 5-minute cadence means the same lesson falls
    # into the window twice. reminded_1h_at guarantees single delivery.
    @lesson.update!(scheduled_at: 65.minutes.from_now, status: "scheduled")
    assert_difference "Notification.count", 2 do # teacher + student, once
      perform_enqueued_jobs do
        LessonReminderJob.perform_now
        travel 5.minutes
        LessonReminderJob.perform_now
      end
    end
  ensure
    travel_back
  end

  test "24h reminder fires once across two overlapping runs" do
    @lesson.update!(scheduled_at: 24.hours.from_now + 5.minutes, status: "scheduled")
    assert_difference "Notification.count", 2 do
      perform_enqueued_jobs do
        LessonReminderJob.perform_now
        travel 5.minutes
        LessonReminderJob.perform_now
      end
    end
  ensure
    travel_back
  end
end
