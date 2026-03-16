class MessagePolicy < ApplicationPolicy
  def create?
    conversation = record.conversation
    return false unless conversation

    if conversation.homologation_request_id.present?
      request = conversation.homologation_request
      request.user_id == user.id || user.coordinator? || user.super_admin?
    elsif conversation.teacher_student_id.present?
      ts = conversation.teacher_student_link
      ts.teacher_id == user.id || ts.student_id == user.id || user.coordinator? || user.super_admin?
    else
      false
    end
  end

  class Scope < ApplicationPolicy::Scope
    def resolve = scope.none
  end
end
