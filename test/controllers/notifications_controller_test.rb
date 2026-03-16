require "test_helper"

class NotificationsControllerTest < ActionDispatch::IntegrationTest
  test "user sees own notifications" do
    sign_in users(:student_ana)
    get notifications_path
    assert_response :ok
    assert_equal "notifications/Index", inertia.component
  end

  test "unauthenticated user cannot see notifications" do
    get notifications_path
    assert_redirected_to new_session_path
  end

  test "mark single notification as read and redirect to notifiable" do
    sign_in users(:student_ana)
    notification = notifications(:ana_unread_notification)
    assert_nil notification.read_at
    patch notification_path(notification)
    assert_response :redirect
    assert notification.reload.read?
    assert_redirected_to homologation_request_path(notification.notifiable_id)
  end

  test "cannot mark other user's notification as read" do
    sign_in users(:student_pedro)
    notification = notifications(:ana_unread_notification)
    patch notification_path(notification)
    assert_response :forbidden
  end

  test "mark all as read works" do
    sign_in users(:student_ana)
    post mark_all_read_notifications_path
    assert_response :redirect
    assert_equal 0, users(:student_ana).notifications.unread.count
  end
end
