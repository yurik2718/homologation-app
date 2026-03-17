class HomologationRequestsController < InertiaController
  include RequestSerializer
  before_action :set_request, only: [ :show, :update, :confirm_payment, :download_document, :retry_sync ]

  def index
    authorize HomologationRequest
    @requests = policy_scope(HomologationRequest).kept.includes(:user).order(updated_at: :desc)
    render inertia: "requests/Index", props: { requests: @requests.map { |r| request_list_json(r) } }
  end

  def new
    authorize HomologationRequest.new
    render inertia: "requests/New"
  end

  def create
    @request = current_user.homologation_requests.build(request_params)
    authorize @request

    @request.status = params[:commit] == "draft" ? "draft" : "submitted"

    if @request.save
      msg = @request.status == "draft" ? t("flash.request_created") : t("flash.request_submitted")
      if @request.status == "submitted"
        notify_coordinators_new_request(@request)
      end
      redirect_to homologation_request_path(@request), notice: msg
    else
      redirect_to new_homologation_request_path, inertia: { errors: @request.errors }
    end
  end

  def show
    authorize @request
    if current_user.coordinator? || current_user.super_admin?
      begin
        @request.conversation&.add_participant!(current_user)
      rescue ActiveRecord::RecordNotUnique
        # already a participant (concurrent requests) — ignore
      end
    end
    render inertia: "requests/Show", props: { request: request_detail_json(@request) }
  end

  def update
    authorize @request

    if params[:status].present?
      @request.transition_to!(params[:status], changed_by: current_user)
      notify_student_status_changed(@request)
      redirect_to homologation_request_path(@request), notice: t("flash.status_updated")
    else
      if @request.update(request_params)
        redirect_to homologation_request_path(@request), notice: t("flash.request_updated")
      else
        redirect_to homologation_request_path(@request), inertia: { errors: @request.errors }
      end
    end
  end

  def confirm_payment
    authorize @request

    ActiveRecord::Base.transaction do
      @request.update!(payment_amount: params[:payment_amount], payment_confirmed_by: current_user.id)
      @request.transition_to!("payment_confirmed", changed_by: current_user)
    end

    AmoCrmSyncJob.perform_later(@request.id)
    notify_student_payment_confirmed(@request)
    redirect_to homologation_request_path(@request), notice: t("flash.payment_confirmed")
  end

  def retry_sync
    authorize @request, :retry_sync?
    @request.update!(amo_crm_sync_error: nil)
    AmoCrmSyncJob.perform_later(@request.id)
    redirect_to homologation_request_path(@request), notice: t("flash.sync_retried")
  end

  def download_document
    authorize @request, :download_document?
    blob = ActiveStorage::Blob.find(params[:document_id])
    redirect_to rails_blob_url(blob, disposition: "attachment"), allow_other_host: true
  end

  private

  def set_request
    @request = HomologationRequest.kept
      .includes(:user, conversation: { messages: :user },
                application_attachment: :blob,
                originals_attachments: :blob,
                documents_attachments: :blob)
      .find(params[:id])
  end

  def request_params
    params.permit(
      :subject, :service_type, :description,
      :identity_card, :passport,
      :education_system, :studies_finished, :study_type_spain, :studies_spain,
      :university, :referral_source, :language_knowledge, :language_certificate,
      :privacy_accepted,
      application: [], originals: [], documents: []
    )
  end

  def request_detail_json(r)
    { id: r.id, subject: r.subject, serviceType: r.service_type, status: r.status,
      description: r.description, identityCard: r.identity_card, passport: r.passport,
      educationSystem: r.education_system, studiesFinished: r.studies_finished,
      studyTypeSpain: r.study_type_spain, studiesSpain: r.studies_spain,
      university: r.university, referralSource: r.referral_source,
      languageKnowledge: r.language_knowledge, languageCertificate: r.language_certificate,
      paymentAmount: r.payment_amount&.to_f, paymentConfirmedAt: r.payment_confirmed_at&.iso8601,
      amoCrmLeadId: r.amo_crm_lead_id, amoCrmSyncedAt: r.amo_crm_synced_at&.iso8601,
      amoCrmSyncError: r.amo_crm_sync_error,
      createdAt: r.created_at.iso8601, updatedAt: r.updated_at.iso8601,
      user: { id: r.user.id, name: r.user.name, email: r.user.email_address },
      conversation: r.conversation ? conversation_json(r.conversation) : nil,
      files: files_json(r) }
  end

  def conversation_json(c)
    {
      id: c.id,
      messages: c.messages.order(:created_at).map(&:as_json_for_cable)
    }
  end

  def files_json(r)
    files = []
    files << blob_file_hash(r.application.blob, "application") if r.application.attached?
    r.originals.each { |att| files << blob_file_hash(att.blob, "originals") }
    r.documents.each { |att| files << blob_file_hash(att.blob, "documents") }
    files
  end

  def blob_file_hash(blob, category)
    { id: blob.id, filename: blob.filename.to_s, contentType: blob.content_type,
      byteSize: blob.byte_size, category: category }
  end

  def notify_coordinators_new_request(request)
    coordinators = User.joins(:roles).where(roles: { name: [ "coordinator", "super_admin" ] })
    coordinators.find_each do |coordinator|
      NotificationJob.perform_later(
        user_id: coordinator.id,
        title: I18n.t("notifications.new_request", name: request.user.name),
        notifiable: request
      )
    end
  end

  def notify_student_status_changed(request)
    NotificationJob.perform_later(
      user_id: request.user_id,
      title: I18n.t("notifications.status_changed", status: request.status),
      notifiable: request
    )
  end

  def notify_student_payment_confirmed(request)
    NotificationJob.perform_later(
      user_id: request.user_id,
      title: I18n.t("notifications.payment_confirmed",
                     amount: request.payment_amount.to_f,
                     subject: request.subject),
      notifiable: request
    )
  end
end
