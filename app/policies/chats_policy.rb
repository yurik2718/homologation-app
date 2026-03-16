class ChatsPolicy < ApplicationPolicy
  def index? = user.coordinator? || user.super_admin?
  def show?  = user.coordinator? || user.super_admin?

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.none
  end
end
