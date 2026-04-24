require "test_helper"

class AwaitingReplyReminderJobTest < ActiveJob::TestCase
  setup do
    @student = create(:user, :student)
  end

  test "reminds student when request is 48h+ in awaiting_reply" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "awaiting_reply", status_changed_at: 49.hours.ago)

    assert_difference "Notification.count", 1 do
      perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
    end
    assert_equal request, Notification.last.notifiable
    assert_equal @student, Notification.last.user
  end

  test "does not remind when less than 48h in awaiting_reply" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "awaiting_reply", status_changed_at: 10.hours.ago)

    assert_no_difference "Notification.count" do
      perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
    end
  end

  test "does not remind for non-awaiting_reply statuses" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "in_review", status_changed_at: 49.hours.ago)

    assert_no_difference "Notification.count" do
      perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
    end
  end

  test "skips soft-deleted requests" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "awaiting_reply", status_changed_at: 49.hours.ago,
                           discarded_at: Time.current)

    assert_no_difference "Notification.count" do
      perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
    end
  end

  test "fires once across two runs" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "awaiting_reply", status_changed_at: 49.hours.ago)

    assert_difference "Notification.count", 1 do
      perform_enqueued_jobs do
        AwaitingReplyReminderJob.perform_now
        AwaitingReplyReminderJob.perform_now
      end
    end
  end

  test "re-fires if status leaves awaiting_reply and comes back" do
    request = create(:homologation_request, :submitted, user: @student)
    request.update_columns(status: "awaiting_reply", status_changed_at: 49.hours.ago)

    perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
    assert_equal 1, @student.notifications.count

    # Status cycles away then back. status_changed_at advances to the time of
    # the return transition, which lands past the stamp → re-qualifies.
    travel 1.day do
      request.update_columns(status: "in_review", status_changed_at: Time.current)
    end
    travel 3.days do
      request.update_columns(status: "awaiting_reply", status_changed_at: 49.hours.ago)

      assert_difference "Notification.count", 1 do
        perform_enqueued_jobs { AwaitingReplyReminderJob.perform_now }
      end
    end
  end
end
