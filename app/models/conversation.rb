class Conversation < ApplicationRecord
  belongs_to :homologation_request, optional: true
  belongs_to :teacher_student_link, class_name: "TeacherStudent",
             foreign_key: :teacher_student_id, optional: true

  has_many :messages, dependent: :destroy
  has_one  :latest_message, -> { order(created_at: :desc) }, class_name: "Message"
  has_many :conversation_participants, dependent: :destroy
  has_many :participants, through: :conversation_participants, source: :user

  validate :must_have_one_association

  def add_participant!(user)
    conversation_participants.find_or_create_by!(user: user)
  end

  def title
    if homologation_request_id?
      homologation_request&.subject || "Request ##{homologation_request_id}"
    else
      ts = teacher_student_link
      "#{ts&.teacher&.name} — #{ts&.student&.name}"
    end
  end

  def unread_for?(user)
    cp = conversation_participants.detect { |p| p.user_id == user.id }
    return true unless cp&.last_read_at
    last_message_at && cp.last_read_at < last_message_at
  end

  private

  def must_have_one_association
    if homologation_request_id.blank? && teacher_student_id.blank?
      errors.add(:base, "must belong to a homologation request or teacher-student pair")
    end
  end
end
