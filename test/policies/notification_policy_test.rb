require "test_helper"

class NotificationPolicyTest < ActiveSupport::TestCase
  # Notifications carry personal info (payment alerts, chat mentions). A user
  # must only see / mutate their own. Scope MUST enforce this at the DB layer.
  setup do
    @ana = create(:user, :student)
    @pedro = create(:user, :student)
    @boss = create(:user, :super_admin)
    @ana_notification = create(:notification, user: @ana)
    @pedro_notification = create(:notification, user: @pedro)
  end

  # === index? — any authenticated user can list (scope filters per-user) ===

  test "authenticated student can see own notifications index" do
    assert NotificationPolicy.new(@ana, Notification).index?
  end

  test "authenticated super_admin can see own notifications index" do
    assert NotificationPolicy.new(@boss, Notification).index?
  end

  test "anonymous cannot see notifications index" do
    refute NotificationPolicy.new(nil, Notification).index?
  end

  # === update? — only owner can mark own as read ===

  test "owner can update own notification" do
    assert NotificationPolicy.new(@ana, @ana_notification).update?
  end

  test "other user cannot update someone else's notification" do
    refute NotificationPolicy.new(@pedro, @ana_notification).update?
  end

  test "super_admin cannot update another user's notification" do
    # Notifications are personal — even admins don't touch them
    refute NotificationPolicy.new(@boss, @ana_notification).update?
  end

  test "anonymous cannot update any notification" do
    refute NotificationPolicy.new(nil, @ana_notification).update?
  end

  # === mark_all_read? — any authenticated user (scope handles per-user) ===

  test "authenticated user can mark_all_read" do
    assert NotificationPolicy.new(@ana, Notification).mark_all_read?
  end

  test "anonymous cannot mark_all_read" do
    refute NotificationPolicy.new(nil, Notification).mark_all_read?
  end

  # === Scope — must only return notifications belonging to the user ===

  test "Scope returns only user's notifications" do
    resolved = NotificationPolicy::Scope.new(@ana, Notification).resolve
    assert_includes resolved, @ana_notification
    refute_includes resolved, @pedro_notification
  end

  test "Scope for super_admin also limited to own notifications" do
    admin_notification = create(:notification, user: @boss)
    resolved = NotificationPolicy::Scope.new(@boss, Notification).resolve
    assert_includes resolved, admin_notification
    refute_includes resolved, @ana_notification
    refute_includes resolved, @pedro_notification
  end
end
