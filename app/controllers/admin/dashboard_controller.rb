module Admin
  class DashboardController < InertiaController
    include RequestSerializer

    def index
      authorize :admin_dashboard, :index?

      render inertia: "admin/Dashboard", props: {
        stats: {
          totalRequests: HomologationRequest.count,
          openRequests: HomologationRequest.where.not(status: %w[resolved closed draft]).count,
          awaitingPayment: HomologationRequest.where(status: "awaiting_payment").count,
          resolved: HomologationRequest.where(status: "resolved").count,
          totalUsers: User.kept.count,
          totalTeachers: User.joins(:roles).where(roles: { name: "teacher" }).count
        },
        requestsByMonth: requests_by_month,
        requestsByStatus: HomologationRequest.group(:status).count,
        recentRequests: HomologationRequest
          .includes(:user)
          .order(created_at: :desc)
          .limit(10)
          .map { |r| request_list_json(r) },
        failedSyncs: HomologationRequest.where.not(amo_crm_sync_error: nil).count
      }
    end

    private

    def requests_by_month
      months = (0..11).map { |i| (Date.current << i).strftime("%Y-%m") }.reverse
      counts = HomologationRequest
        .where(created_at: 12.months.ago..)
        .group("strftime('%Y-%m', created_at)")
        .order("1")
        .count
      months.index_with { |m| counts[m] || 0 }
    end
  end
end
