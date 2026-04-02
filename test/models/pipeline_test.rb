require "test_helper"

class PipelineTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup do
    @request = homologation_requests(:ana_equivalencia)
    @request.update_columns(
      status: "payment_confirmed",
      payment_confirmed_at: Time.current,
      payment_amount: 500.00
    )
    @admin = users(:super_admin_boss)
  end

  # === enter_pipeline! ===

  test "enter_pipeline! sets stage to pago_recibido" do
    @request.enter_pipeline!
    assert_equal "pago_recibido", @request.pipeline_stage
  end

  test "enter_pipeline! initializes document_checklist with all false" do
    @request.enter_pipeline!
    checklist = @request.document_checklist
    assert_equal 10, checklist.size
    assert checklist.values.all? { |v| v == false }
  end

  test "enter_pipeline! sets year from payment_confirmed_at" do
    @request.update_columns(payment_confirmed_at: Time.zone.parse("2025-06-15"))
    @request.enter_pipeline!
    assert_equal 2025, @request.year
  end

  test "enter_pipeline! uses current year if payment_confirmed_at is nil" do
    @request.update_columns(payment_confirmed_at: nil)
    @request.enter_pipeline!
    assert_equal Time.current.year, @request.year
  end

  test "enter_pipeline! is idempotent — does nothing if already in pipeline" do
    @request.enter_pipeline!
    @request.advance_pipeline!
    @request.enter_pipeline! # should not reset
    assert_equal "documentos", @request.pipeline_stage
  end

  # === effective_pipeline_stages ===

  test "stages include traduccion for non-Spanish-speaking country (RU)" do
    # student_ana has country: RU
    @request.enter_pipeline!
    stages = @request.effective_pipeline_stages
    assert_includes stages, "traduccion"
  end

  test "stages skip traduccion for Spanish-speaking country (CO)" do
    # student_pedro has country: CO
    request = homologation_requests(:ana_draft)
    request.update_columns(
      status: "payment_confirmed",
      user_id: users(:student_pedro).id,
      payment_amount: 500,
      payment_confirmed_at: Time.current
    )
    request.enter_pipeline!
    stages = request.effective_pipeline_stages
    refute_includes stages, "traduccion"
  end

  test "cotejo routes to cotejo_ministerio for RU" do
    @request.enter_pipeline!
    stages = @request.effective_pipeline_stages
    assert_includes stages, "cotejo_ministerio"
    refute_includes stages, "cotejo_delegacion"
  end

  test "cotejo routes to cotejo_delegacion for CO" do
    request = homologation_requests(:ana_draft)
    request.update_columns(
      status: "payment_confirmed",
      user_id: users(:student_pedro).id,
      payment_amount: 500,
      payment_confirmed_at: Time.current
    )
    request.enter_pipeline!
    stages = request.effective_pipeline_stages
    assert_includes stages, "cotejo_delegacion"
    refute_includes stages, "cotejo_ministerio"
  end

  # === advance_pipeline! ===

  test "advance from pago_recibido goes to documentos" do
    @request.enter_pipeline!
    @request.advance_pipeline!
    assert_equal "documentos", @request.pipeline_stage
  end

  test "advance from documentos goes to traduccion for non-Spanish country" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "documentos")
    @request.advance_pipeline!
    assert_equal "traduccion", @request.pipeline_stage
  end

  test "advance from documentos skips traduccion for Spanish-speaking country" do
    request = homologation_requests(:ana_draft)
    request.update_columns(
      status: "payment_confirmed",
      user_id: users(:student_pedro).id,
      payment_amount: 500,
      payment_confirmed_at: Time.current
    )
    request.enter_pipeline!
    request.update_columns(pipeline_stage: "documentos")
    request.advance_pipeline!
    assert_equal "tasas_volantes", request.pipeline_stage
  end

  test "advance from redsara goes to cotejo_ministerio for RU" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "redsara")
    @request.advance_pipeline!
    assert_equal "cotejo_ministerio", @request.pipeline_stage
  end

  test "advance from redsara goes to cotejo_delegacion for CO" do
    request = homologation_requests(:ana_draft)
    request.update_columns(
      status: "payment_confirmed",
      user_id: users(:student_pedro).id,
      payment_amount: 500,
      payment_confirmed_at: Time.current
    )
    request.enter_pipeline!
    request.update_columns(pipeline_stage: "redsara")
    request.advance_pipeline!
    assert_equal "cotejo_delegacion", request.pipeline_stage
  end

  test "advance from completado raises InvalidTransition" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "completado")
    assert_raises(HomologationRequest::InvalidTransition) do
      @request.advance_pipeline!
    end
  end

  # === retreat_pipeline! ===

  test "retreat from documentos goes to pago_recibido" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "documentos")
    @request.retreat_pipeline!
    assert_equal "pago_recibido", @request.pipeline_stage
  end

  test "retreat from pago_recibido raises InvalidTransition" do
    @request.enter_pipeline!
    assert_raises(HomologationRequest::InvalidTransition) do
      @request.retreat_pipeline!
    end
  end

  test "retreat from cotejo_ministerio goes to redsara" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "cotejo_ministerio")
    @request.retreat_pipeline!
    assert_equal "redsara", @request.pipeline_stage
  end

  # === sync_status_from_pipeline! ===

  test "pago_recibido keeps status as payment_confirmed" do
    @request.enter_pipeline!
    assert_equal "payment_confirmed", @request.reload.status
  end

  test "documentos sets status to in_progress" do
    @request.enter_pipeline!
    @request.advance_pipeline!
    assert_equal "in_progress", @request.reload.status
  end

  test "completado sets status to resolved" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "cotejo_ministerio")
    @request.advance_pipeline!
    assert_equal "completado", @request.pipeline_stage
    assert_equal "resolved", @request.reload.status
  end

  # === can_advance? / can_retreat? ===

  test "can_advance? is true when not at last stage" do
    @request.enter_pipeline!
    assert @request.can_advance?
  end

  test "can_advance? is false at completado" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "completado")
    refute @request.can_advance?
  end

  test "can_retreat? is false at pago_recibido" do
    @request.enter_pipeline!
    refute @request.can_retreat?
  end

  test "can_retreat? is true at documentos" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "documentos")
    assert @request.can_retreat?
  end

  # === document_checklist ===

  test "toggle_checklist_item! toggles a single flag" do
    @request.enter_pipeline!
    @request.toggle_checklist_item!("sol")
    assert @request.document_checklist["sol"]
    @request.toggle_checklist_item!("sol")
    refute @request.document_checklist["sol"]
  end

  test "documents_complete_count counts true values" do
    @request.enter_pipeline!
    assert_equal 0, @request.documents_complete_count
    @request.update!(document_checklist: @request.document_checklist.merge("sol" => true, "vol" => true))
    assert_equal 2, @request.documents_complete_count
  end

  # === sync_status_from_pipeline! sets status_changed_at ===

  test "advance sets status_changed_at" do
    @request.enter_pipeline!
    @request.advance_pipeline!
    assert_not_nil @request.reload.status_changed_at
  end

  # === AmoCRM sync triggered by pipeline advance ===

  test "advance to in_progress enqueues AmoCrmStatusSyncJob when amo_crm_lead_id present" do
    @request.enter_pipeline!
    @request.update_columns(amo_crm_lead_id: "12345")
    assert_enqueued_with(job: AmoCrmStatusSyncJob) do
      @request.advance_pipeline!
    end
  end

  test "advance to in_progress does not enqueue sync without amo_crm_lead_id" do
    @request.enter_pipeline!
    assert_no_enqueued_jobs(only: AmoCrmStatusSyncJob) do
      @request.advance_pipeline!
    end
  end

  test "advance to completado enqueues AmoCrmStatusSyncJob when amo_crm_lead_id present" do
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "cotejo_ministerio", amo_crm_lead_id: "12345")
    assert_enqueued_with(job: AmoCrmStatusSyncJob) do
      @request.advance_pipeline!
    end
  end

  # === Country missing blocks advance from redsara ===

  test "advance from redsara raises when country is nil" do
    user = @request.user
    user.update_columns(country: nil)
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "redsara")
    assert_raises(HomologationRequest::InvalidTransition) do
      @request.advance_pipeline!
    end
  end

  test "advance from redsara raises when country is unknown" do
    user = @request.user
    user.update_columns(country: "ZZ")
    @request.enter_pipeline!
    @request.update_columns(pipeline_stage: "redsara")
    assert_raises(HomologationRequest::InvalidTransition) do
      @request.advance_pipeline!
    end
  end

  test "country_missing_for_cotejo? true when country nil" do
    @request.user.update_columns(country: nil)
    @request.enter_pipeline!
    assert @request.country_missing_for_cotejo?
  end

  test "country_missing_for_cotejo? false when country known" do
    @request.enter_pipeline!
    refute @request.country_missing_for_cotejo?
  end

  # === effective_pipeline_stages excludes cotejo when country missing ===

  test "stages skip cotejo when country unknown" do
    @request.user.update_columns(country: nil)
    @request.enter_pipeline!
    stages = @request.effective_pipeline_stages
    refute_includes stages, "cotejo_ministerio"
    refute_includes stages, "cotejo_delegacion"
    assert_includes stages, "completado"
  end
end
