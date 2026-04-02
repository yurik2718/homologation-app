require "test_helper"

class HomologationRequestTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test "valid transition from draft to submitted" do
    request = homologation_requests(:ana_draft)
    request.update!(privacy_accepted: true)
    request.transition_to!("submitted", changed_by: users(:student_ana))
    assert_equal "submitted", request.reload.status
  end

  test "invalid transition from draft to resolved raises error" do
    request = homologation_requests(:ana_draft)
    assert_raises(HomologationRequest::InvalidTransition) do
      request.transition_to!("resolved", changed_by: users(:coordinator_maria))
    end
  end

  test "full happy path transition chain" do
    request = homologation_requests(:ana_draft)
    coordinator = users(:coordinator_maria)
    student = users(:student_ana)

    request.update!(privacy_accepted: true)
    request.transition_to!("submitted", changed_by: student)
    request.transition_to!("in_review", changed_by: coordinator)
    request.transition_to!("awaiting_payment", changed_by: coordinator)
    request.update!(payment_amount: 100)
    request.transition_to!("payment_confirmed", changed_by: coordinator)
    request.transition_to!("in_progress", changed_by: coordinator)
    request.transition_to!("resolved", changed_by: coordinator)
    assert_equal "resolved", request.reload.status
  end

  test "payment_confirmed_at is set when transitioning to payment_confirmed" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "awaiting_payment", payment_amount: 100)
    request.transition_to!("payment_confirmed", changed_by: users(:coordinator_maria))
    assert_not_nil request.payment_confirmed_at
  end

  test "subject is required" do
    request = HomologationRequest.new(user: users(:student_ana), service_type: "equivalencia")
    refute request.valid?
    assert request.errors[:subject].any?
  end

  test "service_type is required" do
    request = HomologationRequest.new(user: users(:student_ana), subject: "Test")
    refute request.valid?
    assert request.errors[:service_type].any?
  end

  test "soft delete discard and kept scopes" do
    request = homologation_requests(:ana_equivalencia)
    assert_includes HomologationRequest.kept, request
    request.discard
    refute_includes HomologationRequest.kept.reload, request
    assert_includes HomologationRequest.discarded, request
  end

  test "undiscard restores request" do
    request = homologation_requests(:ana_draft)
    request.discard
    request.undiscard
    assert_includes HomologationRequest.kept, request
    refute request.discarded?
  end

  test "transition to submitted creates a conversation" do
    request = homologation_requests(:ana_draft)
    request.update!(privacy_accepted: true)
    assert_difference "Conversation.count", 1 do
      request.transition_to!("submitted", changed_by: users(:student_ana))
    end
    assert_not_nil request.reload.conversation
  end

  test "conversation participant created for student on submission" do
    request = homologation_requests(:ana_draft)
    request.update!(privacy_accepted: true)
    assert_difference "ConversationParticipant.count", 1 do
      request.transition_to!("submitted", changed_by: users(:student_ana))
    end
  end

  # === Status machine: invalid transitions blocked ===

  test "cannot skip from submitted directly to payment_confirmed" do
    request = homologation_requests(:ana_equivalencia) # status: submitted
    assert_raises(HomologationRequest::InvalidTransition) do
      request.transition_to!("payment_confirmed", changed_by: users(:coordinator_maria))
    end
  end

  test "cannot go backwards from in_review to submitted" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "in_review")
    assert_raises(HomologationRequest::InvalidTransition) do
      request.transition_to!("submitted", changed_by: users(:coordinator_maria))
    end
  end

  test "awaiting_reply can return to in_review" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "awaiting_reply")
    request.transition_to!("in_review", changed_by: users(:coordinator_maria))
    assert_equal "in_review", request.status
  end

  test "in_progress can transition to closed" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "in_progress")
    request.transition_to!("closed", changed_by: users(:coordinator_maria))
    assert_equal "closed", request.status
  end

  test "resolved is a terminal state" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "resolved")
    assert_raises(HomologationRequest::InvalidTransition) do
      request.transition_to!("in_progress", changed_by: users(:coordinator_maria))
    end
  end

  test "transition sets status_changed_by" do
    request = homologation_requests(:ana_equivalencia) # submitted
    coordinator = users(:coordinator_maria)
    request.transition_to!("in_review", changed_by: coordinator)
    assert_equal coordinator.id, request.status_changed_by
  end

  test "transition sets status_changed_at" do
    request = homologation_requests(:ana_equivalencia)
    request.transition_to!("in_review", changed_by: users(:coordinator_maria))
    assert_not_nil request.status_changed_at
  end

  test "post-payment status transition enqueues AmoCrmStatusSyncJob" do
    request = homologation_requests(:ana_equivalencia)
    request.update_columns(status: "payment_confirmed", amo_crm_lead_id: "888")

    assert_enqueued_with(job: AmoCrmStatusSyncJob) do
      request.transition_to!("in_progress", changed_by: users(:coordinator_maria))
    end
  end

  test "pre-payment status transition does not enqueue AmoCrmStatusSyncJob" do
    request = homologation_requests(:ana_equivalencia) # submitted
    assert_no_enqueued_jobs(only: AmoCrmStatusSyncJob) do
      request.transition_to!("in_review", changed_by: users(:coordinator_maria))
    end
  end

  # === Privacy accepted validation ===

  test "submitted request requires privacy_accepted" do
    request = HomologationRequest.new(
      user: users(:student_ana), subject: "Test", service_type: "equivalencia",
      status: "submitted", privacy_accepted: false
    )
    refute request.valid?
    assert request.errors[:privacy_accepted].any?
  end

  test "draft request does not require privacy_accepted" do
    request = HomologationRequest.new(
      user: users(:student_ana), subject: "Test", service_type: "equivalencia",
      status: "draft", privacy_accepted: false
    )
    assert request.valid?, "Expected draft to be valid without privacy_accepted: #{request.errors.full_messages}"
  end

  test "submitted request with privacy_accepted true is valid" do
    request = HomologationRequest.new(
      user: users(:student_ana), subject: "Test", service_type: "equivalencia",
      status: "submitted", privacy_accepted: true
    )
    assert request.valid?, "Expected submitted request with privacy_accepted to be valid: #{request.errors.full_messages}"
  end

  # NOTE: Pipeline tests (enter_pipeline!, advance_pipeline!, retreat_pipeline!,
  # toggle_checklist_item!, sync_status_from_pipeline!) live in test/models/pipeline_test.rb
end
