require "test_helper"
require "webmock/minitest"

class AmoCrmSyncJobTest < ActiveJob::TestCase
  setup do
    WebMock.disable_net_connect!

    AmoCrmToken.create!(
      access_token: "test_token",
      refresh_token: "test_refresh",
      expires_at: 1.hour.from_now
    )

    # Stub contact search (none found) + create
    stub_request(:get, /api\/v4\/contacts/)
      .to_return(status: 200, body: { _embedded: { contacts: [] } }.to_json,
                 headers: { "Content-Type" => "application/json" })

    stub_request(:post, /api\/v4\/contacts/)
      .to_return(status: 200,
                 body: { _embedded: { contacts: [ { id: 999 } ] } }.to_json,
                 headers: { "Content-Type" => "application/json" })

    # Stub lead create
    stub_request(:post, /api\/v4\/leads/)
      .to_return(status: 200,
                 body: { _embedded: { leads: [ { id: 888 } ] } }.to_json,
                 headers: { "Content-Type" => "application/json" })

    @student = create(:user, :student)
    @request = create(:homologation_request, :submitted, user: @student)
  end

  teardown do
    WebMock.allow_net_connect!
    WebMock.reset!
  end

  test "saves amo_crm_lead_id and contact_id on success" do
    @request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    AmoCrmSyncJob.perform_now(@request.id)

    @request.reload
    assert_equal "888", @request.amo_crm_lead_id
    assert @request.amo_crm_synced_at.present?
    assert_nil @request.amo_crm_sync_error
    assert_equal "999", @request.user.reload.amo_crm_contact_id
  end

  test "saves sync error on failure" do
    WebMock.reset!
    stub_request(:get, /api\/v4\/contacts/)
      .to_return(status: 500, body: "Server Error")

    @request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    # Job retries on failure, so perform_now won't raise — but error is saved
    perform_enqueued_jobs do
      AmoCrmSyncJob.perform_later(@request.id)
    rescue
      # retry_on may re-raise after max attempts
    end

    assert @request.reload.amo_crm_sync_error.present?
  end

  test "does not alert super_admins on non-final attempts" do
    admin = create(:user, :super_admin)
    # Simulate attempt 1 of 3: executions will be 1 inside perform.
    assert_no_difference -> { admin.notifications.count } do
      perform_enqueued_jobs(only: NotificationJob) do
        begin
          job = AmoCrmSyncJob.new(@request.id)
          job.instance_variable_set(:@executions, 1)
          job.send(:perform, @request.id)
        rescue StandardError
          # expected — perform re-raises
        end
      end
    end
  end

  test "alerts every super_admin once on final attempt" do
    admin_1 = create(:user, :super_admin)
    admin_2 = create(:user, :super_admin)

    WebMock.reset!
    stub_request(:get, /api\/v4\/contacts/).to_return(status: 500, body: "boom")

    @request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    # Drive the job to the final attempt directly (retry_on would take 3 runs;
    # we just want to assert the "last attempt" branch fires the alert).
    assert_difference -> { Notification.where(user_id: [ admin_1.id, admin_2.id ]).count }, 2 do
      perform_enqueued_jobs(only: NotificationJob) do
        begin
          job = AmoCrmSyncJob.new(@request.id)
          job.instance_variable_set(:@executions, AmoCrmSyncJob::MAX_ATTEMPTS)
          job.send(:perform, @request.id)
        rescue StandardError
          # expected — perform re-raises
        end
      end
    end
  end

  test "does not alert discarded super_admins" do
    admin_active   = create(:user, :super_admin)
    admin_discarded = create(:user, :super_admin, discarded_at: Time.current)

    WebMock.reset!
    stub_request(:get, /api\/v4\/contacts/).to_return(status: 500, body: "boom")
    @request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    perform_enqueued_jobs(only: NotificationJob) do
      begin
        job = AmoCrmSyncJob.new(@request.id)
        job.instance_variable_set(:@executions, AmoCrmSyncJob::MAX_ATTEMPTS)
        job.send(:perform, @request.id)
      rescue StandardError
      end
    end

    assert_equal 1, admin_active.notifications.count
    assert_equal 0, admin_discarded.notifications.count
  end
end
