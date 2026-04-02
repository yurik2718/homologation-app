class HomologationRequest < ApplicationRecord
  include Discardable

  class InvalidTransition < StandardError; end

  STATUSES = %w[draft submitted in_review awaiting_reply awaiting_payment payment_confirmed in_progress resolved closed].freeze

  VALID_TRANSITIONS = {
    "draft"             => %w[submitted],
    "submitted"         => %w[in_review],
    "in_review"         => %w[awaiting_reply awaiting_payment],
    "awaiting_reply"    => %w[in_review],
    "awaiting_payment"  => %w[payment_confirmed],
    "payment_confirmed" => %w[in_progress],
    "in_progress"       => %w[resolved closed]
  }.freeze

  # --- Pipeline (loaded from config/pipeline.yml) ---

  PIPELINE_CONFIG = Rails.application.config.pipeline

  PIPELINE_STAGES = PIPELINE_CONFIG["stages"].map { |s| s["key"] }.freeze

  SPANISH_SPEAKING_COUNTRIES   = PIPELINE_CONFIG.dig("country_routing", "spanish_speaking").freeze
  COTEJO_MINISTERIO_COUNTRIES  = PIPELINE_CONFIG.dig("country_routing", "cotejo_ministerio").freeze
  COTEJO_DELEGACION_COUNTRIES  = (SPANISH_SPEAKING_COUNTRIES +
    PIPELINE_CONFIG.dig("country_routing", "cotejo_delegacion_extra")).freeze

  CHECKLIST_KEYS = PIPELINE_CONFIG["document_checklist"].map { |d| d["key"] }.freeze
  DEFAULT_DOCUMENT_CHECKLIST = CHECKLIST_KEYS.index_with { false }.freeze

  belongs_to :user
  belongs_to :coordinator, class_name: "User", optional: true

  has_one :conversation, dependent: :destroy

  has_one_attached :application
  has_many_attached :originals
  has_many_attached :documents

  encrypts :identity_card, :passport

  VALID_SERVICE_TYPES = Rails.application.config.select_options["service_types"].map { |o| o["key"] }.freeze

  validates :subject, presence: true
  validates :service_type, presence: true, inclusion: { in: VALID_SERVICE_TYPES }
  validates :pipeline_stage, inclusion: { in: PIPELINE_STAGES }, allow_nil: true
  validates :privacy_accepted, acceptance: { accept: true }, if: -> { status == "submitted" }
  validates :payment_amount, presence: true, numericality: { greater_than: 0 }, if: -> { status == "payment_confirmed" }

  after_save :create_request_conversation!, if: -> { saved_change_to_status? && status == "submitted" }

  def transition_to!(new_status, changed_by:)
    allowed = VALID_TRANSITIONS[status] || []
    raise InvalidTransition, "Cannot transition from #{status} to #{new_status}" unless allowed.include?(new_status)

    attrs = { status: new_status, status_changed_at: Time.current, status_changed_by: changed_by.id }
    attrs[:payment_confirmed_at] = Time.current if new_status == "payment_confirmed"
    update!(attrs)

    if amo_crm_lead_id.present? && %w[in_progress resolved closed].include?(new_status)
      AmoCrmStatusSyncJob.perform_later(id)
    end
  end

  # --- Pipeline methods ---

  def enter_pipeline!
    return if pipeline_stage.present?

    update!(
      pipeline_stage: "pago_recibido",
      document_checklist: DEFAULT_DOCUMENT_CHECKLIST,
      year: (payment_confirmed_at || Time.current).year
    )
  end

  def advance_pipeline!
    if pipeline_stage == "redsara" && country_missing_for_cotejo?
      raise InvalidTransition, "Cannot advance from redsara: student country is not set"
    end

    next_stage = compute_next_stage
    raise InvalidTransition, "Cannot advance from #{pipeline_stage}" unless next_stage

    update!(pipeline_stage: next_stage)
    sync_status_from_pipeline!
  end

  def retreat_pipeline!
    prev_stage = compute_previous_stage
    raise InvalidTransition, "Cannot retreat from #{pipeline_stage}" unless prev_stage

    update!(pipeline_stage: prev_stage)
    sync_status_from_pipeline!
  end

  def next_pipeline_stage
    compute_next_stage
  end

  def can_advance?
    next_pipeline_stage.present?
  end

  def can_retreat?
    compute_previous_stage.present?
  end

  def effective_pipeline_stages
    stages = %w[pago_recibido documentos]
    stages << "traduccion" if requires_translation?
    stages += %w[tasas_volantes redsara]
    stages << cotejo_destination if cotejo_destination
    stages << "completado"
    stages
  end

  def country_missing_for_cotejo?
    cotejo_destination.nil?
  end

  def toggle_checklist_item!(key)
    return unless CHECKLIST_KEYS.include?(key)

    cl = document_checklist || {}
    cl[key] = !cl[key]
    update!(document_checklist: cl)
  end

  def documents_complete_count
    (document_checklist || {}).values.count { |v| v == true }
  end

  private

  def compute_next_stage
    ordered = effective_pipeline_stages
    current_index = ordered.index(pipeline_stage)
    return nil unless current_index
    ordered[current_index + 1]
  end

  def compute_previous_stage
    ordered = effective_pipeline_stages
    current_index = ordered.index(pipeline_stage)
    return nil unless current_index && current_index > 0
    ordered[current_index - 1]
  end

  def requires_translation?
    !SPANISH_SPEAKING_COUNTRIES.include?(user.country&.upcase)
  end

  def cotejo_destination
    country = user.country&.upcase
    if COTEJO_MINISTERIO_COUNTRIES.include?(country)
      "cotejo_ministerio"
    elsif COTEJO_DELEGACION_COUNTRIES.include?(country)
      "cotejo_delegacion"
    end
  end

  def sync_status_from_pipeline!
    new_status = case pipeline_stage
    when "pago_recibido" then "payment_confirmed"
    when "completado" then "resolved"
    else "in_progress"
    end
    return if status == new_status

    update!(status: new_status, status_changed_at: Time.current)

    if amo_crm_lead_id.present? && %w[in_progress resolved].include?(new_status)
      AmoCrmStatusSyncJob.perform_later(id)
    end
  end

  def create_request_conversation!
    conv = Conversation.create!(homologation_request: self)
    conv.conversation_participants.create!(user: user)
  end
end
