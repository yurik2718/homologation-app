class DashboardController < InertiaController
  def index
    authorize :dashboard, :index?
    # TODO Step 6: redirect teachers to lessons_path
    render inertia: "dashboard/Index", props: { stats: build_stats }
  end

  private

  def build_stats
    if current_user.student?
      { myRequests: current_user.homologation_requests.count,
        pendingRequests: current_user.homologation_requests.where.not(status: %w[resolved closed]).count }
    else
      { totalRequests: HomologationRequest.kept.count,
        openRequests: HomologationRequest.kept.where.not(status: %w[resolved closed draft]).count,
        awaitingPayment: HomologationRequest.kept.where(status: "awaiting_payment").count,
        resolved: HomologationRequest.kept.where(status: "resolved").count }
    end
  end
end
