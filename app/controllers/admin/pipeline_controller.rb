# frozen_string_literal: true

class Admin::PipelineController < InertiaController
  def index
    authorize :pipeline, :index?

    scope = HomologationRequest.kept
      .where.not(pipeline_stage: nil)
      .includes(:user)

    scope = scope.where(year: params[:year]) if params[:year].present?
    scope = filter_by_cotejo_route(scope) if params[:cotejo_route].present?
    scope = scope.where(service_type: params[:service_type]) if params[:service_type].present?
    scope = search(scope, params[:q]) if params[:q].present?

    all_requests = scope.order(created_at: :desc).to_a

    grouped = HomologationRequest::PIPELINE_STAGES.each_with_object({}) do |stage, hash|
      hash[stage] = all_requests
        .select { |r| r.pipeline_stage == stage }
        .map { |r| pipeline_card_json(r) }
    end

    not_completed = all_requests.reject { |r| r.pipeline_stage == "completado" }
    stats = {
      active: not_completed.size,
      revenue: all_requests.sum { |r| r.payment_amount.to_f },
      byYear: all_requests.group_by(&:year).transform_values(&:size),
      noPago: all_requests.count { |r| r.payment_amount.nil? || r.payment_amount.zero? },
      cotejo: all_requests.count { |r| r.pipeline_stage.start_with?("cotejo_") },
      cotejoMinisterio: all_requests.count { |r| r.pipeline_stage == "cotejo_ministerio" },
      cotejoDelegacion: all_requests.count { |r| r.pipeline_stage == "cotejo_delegacion" }
    }

    render inertia: "admin/Pipeline", props: {
      stages: grouped,
      stats: stats,
      filters: {
        q: params[:q],
        year: params[:year],
        cotejoRoute: params[:cotejo_route],
        serviceType: params[:service_type]
      }
    }
  end

  def advance
    @request = HomologationRequest.find(params[:id])
    authorize @request, :manage_pipeline?

    @request.advance_pipeline!
    redirect_to admin_pipeline_path, notice: t("flash.pipeline_advanced")
  rescue HomologationRequest::InvalidTransition => e
    redirect_to admin_pipeline_path, alert: e.message
  end

  def retreat
    @request = HomologationRequest.find(params[:id])
    authorize @request, :manage_pipeline?

    @request.retreat_pipeline!
    redirect_to admin_pipeline_path, notice: t("flash.pipeline_retreated")
  rescue HomologationRequest::InvalidTransition => e
    redirect_to admin_pipeline_path, alert: e.message
  end

  def update
    @request = HomologationRequest.find(params[:id])
    authorize @request, :manage_pipeline?

    attrs = pipeline_params.to_h
    if attrs["document_checklist"].present?
      existing = @request.document_checklist || {}
      attrs["document_checklist"] = existing.merge(
        attrs["document_checklist"].transform_values { |v| ActiveModel::Type::Boolean.new.cast(v) }
      )
    end
    @request.update!(attrs)
    redirect_to admin_pipeline_path, notice: t("flash.pipeline_updated")
  end

  private

  def pipeline_params
    params.require(:homologation_request).permit(
      :pipeline_notes, :payment_amount, :year,
      document_checklist: HomologationRequest::CHECKLIST_KEYS
    )
  end

  def pipeline_card_json(r)
    {
      id: r.id,
      studentName: r.user.name,
      phone: r.user.phone,
      country: r.user.country,
      identityCard: r.identity_card.presence || r.passport.presence,
      year: r.year,
      serviceType: r.service_type,
      amount: r.payment_amount.to_f,
      pipelineStage: r.pipeline_stage,
      pipelineNotes: r.pipeline_notes,
      documentChecklist: r.document_checklist || {},
      documentsComplete: r.documents_complete_count,
      documentsTotal: HomologationRequest::CHECKLIST_KEYS.size,
      cotejoRoute: cotejo_route_for(r),
      updatedAt: r.updated_at.iso8601,
      countryMissing: r.country_missing_for_cotejo?,
      canAdvance: r.can_advance?,
      canRetreat: r.can_retreat?,
      nextStageName: r.send(:compute_next_stage),
      requiresTranslation: !HomologationRequest::SPANISH_SPEAKING_COUNTRIES.include?(r.user.country&.upcase)
    }
  end

  def cotejo_route_for(r)
    country = r.user.country&.upcase
    if HomologationRequest::COTEJO_MINISTERIO_COUNTRIES.include?(country)
      "ministerio"
    elsif HomologationRequest::COTEJO_DELEGACION_COUNTRIES.include?(country)
      "delegacion"
    else
      "unknown"
    end
  end

  def filter_by_cotejo_route(requests)
    case params[:cotejo_route]
    when "ministerio"
      requests.joins(:user).where(users: { country: HomologationRequest::COTEJO_MINISTERIO_COUNTRIES })
    when "delegacion"
      requests.joins(:user).where(users: { country: HomologationRequest::COTEJO_DELEGACION_COUNTRIES })
    else
      requests
    end
  end

  def search(requests, query)
    requests.joins(:user).where(
      "users.name LIKE :q OR users.email_address LIKE :q OR homologation_requests.subject LIKE :q",
      q: "%#{query}%"
    )
  end
end
