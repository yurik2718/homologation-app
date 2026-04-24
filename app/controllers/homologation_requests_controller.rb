class HomologationRequestsController < InertiaController
  include RequestSerializer
  include ConversationSerializer
  before_action :set_request, only: [ :show, :update, :confirm_payment, :create_checkout_session, :download_document, :download_all_documents, :retry_sync ]

  def index
    authorize HomologationRequest
    @requests = policy_scope(HomologationRequest).kept.includes(:user).order(updated_at: :desc)
    counts = request_files_counts(@requests.map(&:id))
    render inertia: "requests/Index", props: {
      requests: @requests.map { |r| request_list_json(r, files_count: counts.fetch(r.id, 0)) }
    }
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
        notify_admins_new_request(@request)
      end
      redirect_to homologation_request_path(@request), notice: msg
    else
      redirect_to new_homologation_request_path, inertia: { errors: @request.errors }
    end
  end

  def show
    authorize @request
    if current_user.super_admin?
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
      begin
        @request.transition_to!(params[:status], changed_by: current_user)
      rescue HomologationRequest::InvalidTransition => e
        return redirect_to homologation_request_path(@request), alert: e.message
      end
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
      @request.enter_pipeline!
    end

    AmoCrmSyncJob.perform_later(@request.id)
    notify_student_payment_confirmed(@request)
    redirect_to homologation_request_path(@request), notice: t("flash.payment_confirmed")
  rescue ActiveRecord::RecordInvalid => e
    redirect_to homologation_request_path(@request), alert: e.record.errors.full_messages.join(", ")
  end

  def create_checkout_session
    authorize @request, :confirm_payment?

    amount = BigDecimal(params[:payment_amount].to_s)
    service = StripeCheckoutService.new(@request, created_by: current_user)
    session = service.create_session(amount: amount)

    redirect_to homologation_request_path(@request), flash: { stripe_url: session.url }
  rescue StripeCheckoutService::Error => e
    redirect_to homologation_request_path(@request), alert: e.message
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

  def download_all_documents
    authorize @request, :download_document?
    archive = RequestArchive.new(@request)
    send_data archive.build, type: "application/zip", disposition: "attachment", filename: archive.filename
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
      :university, :language_knowledge, :language_certificate,
      :privacy_accepted,
      application: [], originals: [], documents: []
    )
  end

  def request_detail_json(r)
    { id: r.id, subject: r.subject, serviceType: r.service_type, status: r.status,
      description: r.description, identityCard: r.identity_card, passport: r.passport,
      educationSystem: r.education_system, studiesFinished: r.studies_finished,
      studyTypeSpain: r.study_type_spain, studiesSpain: r.studies_spain,
      university: r.university,
      languageKnowledge: r.language_knowledge, languageCertificate: r.language_certificate,
      paymentAmount: r.payment_amount&.to_f, paymentConfirmedAt: r.payment_confirmed_at&.iso8601,
      amoCrmLeadId: r.amo_crm_lead_id, amoCrmSyncedAt: r.amo_crm_synced_at&.iso8601,
      amoCrmSyncError: r.amo_crm_sync_error,
      createdAt: r.created_at.iso8601, updatedAt: r.updated_at.iso8601,
      user: { id: r.user.id, name: r.user.name, email: r.user.email_address },
      conversation: r.conversation ? conversation_messages_json(r.conversation) : nil,
      files: files_json(r) }
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

  def notify_admins_new_request(request)
    User.super_admins.kept.find_each do |admin|
      NotificationJob.perform_later(
        user_id: admin.id,
        title_key: "notifications.new_request",
        title_params: { name: request.user.name },
        notifiable: request
      )
    end
  end

  def notify_student_status_changed(request)
    NotificationJob.perform_later(
      user_id: request.user_id,
      title_key: "notifications.status_changed",
      title_params: { status: { i18n: "requests.status.#{request.status}" } },
      notifiable: request
    )
  end

  def notify_student_payment_confirmed(request)
    NotificationJob.perform_later(
      user_id: request.user_id,
      title_key: "notifications.payment_confirmed",
      title_params: { amount: request.payment_amount.to_f, subject: request.subject },
      notifiable: request
    )
  end
end
