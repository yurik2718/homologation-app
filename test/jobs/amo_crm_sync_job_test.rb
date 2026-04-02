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
  end

  teardown do
    WebMock.allow_net_connect!
    WebMock.reset!
  end

  test "saves amo_crm_lead_id and contact_id on success" do
    request = homologation_requests(:ana_equivalencia)
    request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    AmoCrmSyncJob.perform_now(request.id)

    request.reload
    assert_equal "888", request.amo_crm_lead_id
    assert request.amo_crm_synced_at.present?
    assert_nil request.amo_crm_sync_error
    assert_equal "999", request.user.reload.amo_crm_contact_id
  end

  test "saves sync error on failure" do
    WebMock.reset!
    stub_request(:get, /api\/v4\/contacts/)
      .to_return(status: 500, body: "Server Error")

    request = homologation_requests(:ana_equivalencia)
    request.update!(status: "payment_confirmed", payment_amount: 100, payment_confirmed_at: Time.current)

    # Job retries on failure, so perform_now won't raise — but error is saved
    perform_enqueued_jobs do
      AmoCrmSyncJob.perform_later(request.id)
    rescue
      # retry_on may re-raise after max attempts
    end

    assert request.reload.amo_crm_sync_error.present?
  end
end
