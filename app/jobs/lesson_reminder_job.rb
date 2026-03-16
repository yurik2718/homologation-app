class LessonReminderJob < ApplicationJob
  queue_as :default

  def perform
    upcoming = Lesson.where(status: "scheduled")
                     .where(scheduled_at: 55.minutes.from_now..65.minutes.from_now)

    upcoming.find_each do |lesson|
      [ lesson.teacher_id, lesson.student_id ].each do |user_id|
        NotificationJob.perform_later(
          user_id: user_id,
          title: I18n.t("notifications.lesson_reminder"),
          body: I18n.t("notifications.lesson_starts_soon",
                       time: lesson.scheduled_at.strftime("%H:%M")),
          notifiable: lesson
        )
      end
    end
  end
end
