class User < ApplicationRecord
  include Discardable

  has_secure_password validations: false

  validates :password, length: { minimum: 8 }, if: -> { password_digest_changed? || (new_record? && provider.blank?) }
  validates :password, presence: true, if: -> { new_record? && provider.blank? }
  validates :password, confirmation: true, if: -> { password_confirmation.present? }

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  has_many :sessions, dependent: :destroy
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_one :teacher_profile, dependent: :destroy
  has_many :homologation_requests
  has_many :taught_lessons, class_name: "Lesson", foreign_key: :teacher_id, dependent: :destroy
  has_many :booked_lessons, class_name: "Lesson", foreign_key: :student_id, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :teacher_student_links, class_name: "TeacherStudent", foreign_key: :teacher_id, dependent: :destroy
  has_many :student_teacher_links, class_name: "TeacherStudent", foreign_key: :student_id, dependent: :destroy

  encrypts :phone, :whatsapp, :guardian_phone, :guardian_whatsapp

  validates :email_address, presence: true, uniqueness: true
  validates :name, presence: true

  def self.find_or_create_from_oauth(auth)
    user = find_by(provider: auth.provider, uid: auth.uid)
    user ||= find_by(email_address: auth.info.email&.downcase&.strip)

    if user
      user.update_columns(provider: auth.provider, uid: auth.uid) if user.uid.blank?
      return user
    end

    User.create!(
      provider:      auth.provider,
      uid:           auth.uid,
      email_address: auth.info.email,
      name:          auth.info.name || auth.info.email,
      avatar_url:    auth.info.image,
      password:      SecureRandom.hex(16)
    ).tap(&:assign_student_role!)
  end

  def assign_student_role!
    user_roles.create!(role: Role.find_by!(name: "student"))
  end

  def profile_complete?
    whatsapp.present? && birthday.present? && country.present?
  end

  def super_admin? = has_role?("super_admin")
  def coordinator? = has_role?("coordinator")
  def teacher?     = has_role?("teacher")
  def student?     = has_role?("student")

  private

  def has_role?(name)
    if roles.loaded?
      roles.any? { |r| r.name == name }
    else
      role_names_cache.include?(name)
    end
  end

  def role_names_cache
    @role_names_cache ||= roles.pluck(:name)
  end
end
