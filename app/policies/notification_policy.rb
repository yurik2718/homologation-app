class NotificationPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def update?
    user.present? && record.user_id == user.id
  end

  def mark_all_read?
    user.present?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(user: user)
    end
  end
end
