# frozen_string_literal: true

class ConversationPolicy < ApplicationPolicy
  def index?
    true # any authenticated user can see their own conversations (filtered by controller)
  end

  def show?
    record.participants.include?(user) || user.coordinator? || user.super_admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.joins(:conversation_participants)
           .where(conversation_participants: { user_id: user.id })
    end
  end
end
