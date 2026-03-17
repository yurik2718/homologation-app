class DashboardController < InertiaController
  include RequestSerializer

  def index
    authorize :dashboard, :index?
    return redirect_to lessons_path if current_user.teacher? && !current_user.coordinator?

    if current_user.student?
      render inertia: "dashboard/Index", props: { stats: student_stats }
    else
      render inertia: "dashboard/Index", props: {
        stats: admin_stats,
        requestsByMonth: requests_by_month,
        recentRequests: recent_requests
      }
    end
  end

  private

  def student_stats
    { myRequests: current_user.homologation_requests.count,
      pendingRequests: current_user.homologation_requests.where.not(status: %w[resolved closed]).count }
  end

  def admin_stats
    now = Time.current
    this_month_start = now.beginning_of_month
    last_month_range = (now - 1.month).beginning_of_month..(now - 1.month).end_of_month

    total = HomologationRequest.kept.count
    open_reqs = HomologationRequest.kept.where.not(status: %w[resolved closed draft]).count
    awaiting = HomologationRequest.kept.where(status: "awaiting_payment").count
    resolved = HomologationRequest.kept.where(status: "resolved").count

    total_users = User.kept.count
    users_this_month = User.kept.where(created_at: this_month_start..).count
    users_last_month = User.kept.where(created_at: last_month_range).count

    requests_this_month = HomologationRequest.kept.where(created_at: this_month_start..).count
    requests_last_month = HomologationRequest.kept.where(created_at: last_month_range).count

    {
      totalRequests: total,
      openRequests: open_reqs,
      awaitingPayment: awaiting,
      resolved: resolved,
      totalUsers: total_users,
      newUsersThisMonth: users_this_month,
      usersChange: percent_change(users_last_month, users_this_month),
      requestsThisMonth: requests_this_month,
      requestsChange: percent_change(requests_last_month, requests_this_month)
    }
  end

  def requests_by_month
    HomologationRequest.kept
      .where(created_at: 12.months.ago..)
      .group("strftime('%Y-%m', created_at)")
      .count
  end

  def recent_requests
    HomologationRequest.kept
      .includes(:user)
      .order(created_at: :desc)
      .limit(5)
      .map { |r| request_list_json(r) }
  end

  def percent_change(old_val, new_val)
    return 0.0 if old_val.zero?
    (((new_val - old_val).to_f / old_val) * 100).round(1)
  end
end
