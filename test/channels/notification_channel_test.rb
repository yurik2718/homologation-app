require "test_helper"

class NotificationChannelTest < ActionCable::Channel::TestCase
  # NotificationChannel streams per-user notifications. Each user gets their
  # own stream — the contract is "stream_for current_user". Two users on the
  # same page must get DIFFERENT streams; otherwise notifications leak.

  setup do
    @ana = create(:user, :student)
    @pedro = create(:user, :student)
  end

  test "authenticated user subscribes and streams for themselves" do
    stub_connection current_user: @ana

    subscribe

    assert subscription.confirmed?
    assert_has_stream_for @ana
  end

  test "two different users get different streams" do
    # Ana's subscription MUST NOT stream for Pedro
    stub_connection current_user: @ana
    subscribe

    ana_stream = NotificationChannel.broadcasting_for(@ana)
    pedro_stream = NotificationChannel.broadcasting_for(@pedro)

    assert_includes subscription.streams, ana_stream
    refute_includes subscription.streams, pedro_stream
  end
end
