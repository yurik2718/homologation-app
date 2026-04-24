class User < ApplicationRecord
  include Discardable

  ALLOWED_LOCALES     = I18n.available_locales.map(&:to_s).freeze
  ALLOWED_COUNTRIES   = Rails.application.config.select_options["countries"].map { |c| c["key"] }.freeze
  PHONE_REGEX         = /\A\+?[\d\s\-().]{6,30}\z/
  EMAIL_REGEX         = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/
  PURGEABLE_STATUSES  = %w[draft resolved closed].freeze

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

  # Identity
  validates :email_address, presence: true, uniqueness: true
  validates :name, presence: true, length: { maximum: 100 }

  # Profile fields
  validates :locale,  inclusion: { in: ALLOWED_LOCALES },   allow_blank: true
  validates :country, inclusion: { in: ALLOWED_COUNTRIES }, allow_blank: true

  # Phone numbers — permissive format, allow blank (filled during profile completion)
  validates :phone,             format: { with: PHONE_REGEX }, allow_blank: true
  validates :whatsapp,          format: { with: PHONE_REGEX }, allow_blank: true
  validates :guardian_phone,    format: { with: PHONE_REGEX }, allow_blank: true
  validates :guardian_whatsapp, format: { with: PHONE_REGEX }, allow_blank: true

  validates :guardian_email, format: { with: EMAIL_REGEX }, allow_blank: true

  validates :birthday,
    comparison: {
      less_than:                -> { Date.current },
      greater_than_or_equal_to: Date.new(1900, 1, 1)
    },
    allow_blank: true

  validate :guardian_fields_required_if_minor
  validate :at_least_one_cabinet

  def self.find_or_create_from_oauth(auth)
    user = find_by(provider: auth.provider, uid: auth.uid)
    user ||= find_by(email_address: auth.info.email&.downcase&.strip)

    if user
      user.update_columns(provider: auth.provider, uid: auth.uid) if user.uid.blank?
      return user
    end

    User.create!(
      provider:         auth.provider,
      uid:              auth.uid,
      email_address:    auth.info.email,
      name:             auth.info.name || auth.info.email,
      avatar_url:       auth.info.image,
      password:         SecureRandom.hex(16),
      has_homologation: true
    ).tap(&:assign_student_role!)
  end

  def assign_student_role!
    user_roles.create!(role: Role.find_by!(name: "student"))
  end

  def purgeable?
    !homologation_requests.where.not(status: PURGEABLE_STATUSES).exists?
  end

  def purge_stats
    req_ids = homologation_requests.pluck(:id)
    file_count = req_ids.any? ?
      ActiveStorage::Attachment.where(record_type: "HomologationRequest", record_id: req_ids).count : 0
    { requests: req_ids.size, files: file_count }
  end

  def schedule_purge!
    update!(purge_scheduled_at: Time.current)
    PurgeUserJob.set(wait: 5.minutes).perform_later(id)
  end

  def cancel_purge!
    update!(purge_scheduled_at: nil)
  end

  def purge_everything!
    transaction do
      # Null out admin references on other users' records
      HomologationRequest.where(payment_confirmed_by: id).update_all(payment_confirmed_by: nil)
      HomologationRequest.where(status_changed_by: id).update_all(status_changed_by: nil)
      TeacherStudent.where(assigned_by: id).update_all(assigned_by: nil)

      # Destroy own requests (cascade: conversation → participants + messages + file purge)
      homologation_requests.each(&:destroy!)

      # Destroy remaining messages by this user in other conversations (with blob purge)
      Message.where(user_id: id).destroy_all

      # Remove remaining conversation participation (other users' chats)
      ConversationParticipant.where(user_id: id).delete_all

      # Destroy user (cascades: sessions, user_roles, teacher_profile, lessons,
      # notifications, teacher_student_links → conversation, student_teacher_links → conversation)
      destroy!
    end
  end

  def gdpr_anonymize!
    transaction do
      update_columns(
        name:                "Deleted User ##{id}",
        email_address:       "deleted_#{id}@gdpr.invalid",
        phone:               nil,
        whatsapp:            nil,
        guardian_name:       nil,
        guardian_email:      nil,
        guardian_phone:      nil,
        guardian_whatsapp:   nil,
        birthday:            nil,
        country:             nil,
        password_digest:     SecureRandom.hex(32),
        provider:            nil,
        uid:                 nil,
        avatar_url:          nil,
        telegram_chat_id:    nil,
        telegram_link_token: nil,
        amo_crm_contact_id:  nil,
        stripe_customer_id:  nil,
        discarded_at:        Time.current
      )
      sessions.destroy_all
    end
  end

  def profile_complete?
    birthday.present? && country.present? && whatsapp.present?
  end

  def age
    return nil unless birthday.present?
    now = Date.current
    age = now.year - birthday.year
    age -= 1 if now < birthday + age.years
    age
  end

  # Class-level role scopes — single query, used across controllers
  scope :with_role, ->(name) { joins(:roles).where(roles: { name: name }) }
  scope :super_admins, -> { with_role("super_admin") }
  scope :coordinators,  -> { with_role("coordinator") }
  scope :teachers,      -> { with_role("teacher") }
  scope :students,      -> { with_role("student") }

  def super_admin? = has_role?("super_admin")
  def coordinator? = has_role?("coordinator")
  def teacher?     = has_role?("teacher")
  def student?     = has_role?("student")

  def homologation_cabinet? = has_homologation?
  def education_cabinet?    = has_education?

  private

  def at_least_one_cabinet
    return if has_homologation? || has_education?
    errors.add(:base, :no_cabinet_selected)
  end

  def guardian_fields_required_if_minor
    return unless is_minor?
    errors.add(:guardian_name,  :blank) if guardian_name.blank?
    errors.add(:guardian_phone, :blank) if guardian_phone.blank?
  end

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
