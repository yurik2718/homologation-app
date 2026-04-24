require "test_helper"
require "ostruct"
require "zip"

class HomologationRequestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :super_admin)
    @coordinator = create(:user, :coordinator)
    @teacher = create(:user, :teacher)
    @student = create(:user, :student)
    @other_student = create(:user, :student, :spanish_speaking)
    @submitted_request = create(:homologation_request, :submitted, :with_conversation, user: @student)
    @draft_request = create(:homologation_request, :draft, user: @student)
  end

  # === Authorization: index ===

  test "student sees own requests" do
    sign_in @student
    get homologation_requests_path
    assert_response :ok
    assert_equal "requests/Index", inertia.component
  end

  test "coordinator cannot see requests" do
    sign_in @coordinator
    get homologation_requests_path
    assert_response :forbidden
  end

  test "super_admin sees all requests" do
    sign_in @admin
    get homologation_requests_path
    assert_response :ok
    assert_equal "requests/Index", inertia.component
  end

  test "index props include filesCount per request for super_admin quick-download icon" do
    sign_in @admin
    request_with_file # attaches 1 original to @submitted_request
    get homologation_requests_path
    props = inertia.props[:requests].find { |r| r[:id] == @submitted_request.id }
    assert_equal 1, props[:filesCount]
    draft_props = inertia.props[:requests].find { |r| r[:id] == @draft_request.id }
    assert_equal 0, draft_props[:filesCount]
  end

  test "teacher cannot access requests" do
    sign_in @teacher
    get homologation_requests_path
    assert_response :forbidden
  end

  # === Authorization: show ===

  test "student can view own request" do
    sign_in @student
    get homologation_request_path(@submitted_request)
    assert_response :ok
    assert_equal "requests/Show", inertia.component
  end

  test "student cannot see other student request" do
    sign_in @other_student
    get homologation_request_path(@submitted_request)
    assert_response :forbidden
  end

  test "coordinator cannot view requests" do
    sign_in @coordinator
    get homologation_request_path(@submitted_request)
    assert_response :forbidden
  end

  test "super_admin can view any request" do
    sign_in @admin
    get homologation_request_path(@submitted_request)
    assert_response :ok
  end

  # === Create ===

  test "student can create request" do
    sign_in @student
    assert_difference "HomologationRequest.count", 1 do
      post homologation_requests_path, params: {
        subject: "New Request", service_type: "equivalencia",
        description: "Test", privacy_accepted: true
      }
    end
    assert_equal "submitted", HomologationRequest.last.status
  end

  test "student can save draft" do
    sign_in @student
    post homologation_requests_path, params: {
      commit: "draft",
      subject: "Draft", service_type: "equivalencia"
    }
    assert_equal "draft", HomologationRequest.last.status
  end

  test "student can access new request form" do
    sign_in @student
    get new_homologation_request_path
    assert_response :ok
    assert_equal "requests/New", inertia.component
  end

  test "coordinator cannot create request (only students can)" do
    sign_in @coordinator
    assert_no_difference "HomologationRequest.count" do
      post homologation_requests_path, params: {
        subject: "Test", service_type: "equivalencia", privacy_accepted: true
      }
    end
    assert_response :forbidden
  end

  # === Create: validation ===

  test "create fails without subject" do
    sign_in @student
    assert_no_difference "HomologationRequest.count" do
      post homologation_requests_path, params: {
        service_type: "equivalencia", privacy_accepted: true
      }
    end
    assert_response :redirect
  end

  test "create fails without service_type" do
    sign_in @student
    assert_no_difference "HomologationRequest.count" do
      post homologation_requests_path, params: {
        subject: "Test", privacy_accepted: true
      }
    end
    assert_response :redirect
  end

  test "create submit fails without privacy_accepted" do
    sign_in @student
    assert_no_difference "HomologationRequest.count" do
      post homologation_requests_path, params: {
        subject: "Test", service_type: "equivalencia", privacy_accepted: false
      }
    end
    assert_response :redirect
  end

  test "create draft allows privacy_accepted false" do
    sign_in @student
    assert_difference "HomologationRequest.count", 1 do
      post homologation_requests_path, params: {
        commit: "draft",
        subject: "Draft", service_type: "equivalencia", privacy_accepted: false
      }
    end
    assert_equal "draft", HomologationRequest.last.status
    assert_equal false, HomologationRequest.last.privacy_accepted
  end

  # === Create: optional fields ===

  test "create persists education and identity fields" do
    sign_in @student
    post homologation_requests_path, params: {
      subject: "Full request", service_type: "homologacion",
      privacy_accepted: true,
      identity_card: "X1234567Z",
      education_system: "russia",
      studies_finished: "yes",
      study_type_spain: "grado",
      studies_spain: "Ingeniería Informática",
      university: "ucm",
      language_knowledge: "b2",
      language_certificate: "dele"
    }
    r = HomologationRequest.last
    assert_equal "submitted", r.status
    assert_equal "X1234567Z", r.identity_card
    assert_equal "russia", r.education_system
    assert_equal "yes", r.studies_finished
    assert_equal "grado", r.study_type_spain
    assert_equal "Ingeniería Informática", r.studies_spain
    assert_equal "ucm", r.university
    assert_equal "b2", r.language_knowledge
    assert_equal "dele", r.language_certificate
  end

  test "create with only required fields leaves optional fields nil" do
    sign_in @student
    post homologation_requests_path, params: {
      subject: "Minimal", service_type: "equivalencia", privacy_accepted: true
    }
    r = HomologationRequest.last
    assert_equal "submitted", r.status
    assert_nil r.education_system
    assert_nil r.identity_card
    assert_nil r.language_knowledge
    assert_nil r.university
  end

  # === Create: file uploads ===

  test "create with file attachments persists files" do
    sign_in @student
    file = fixture_file_upload("test_document.pdf", "application/pdf")

    assert_difference "HomologationRequest.count", 1 do
      post homologation_requests_path, params: {
        subject: "With files", service_type: "equivalencia", privacy_accepted: true,
        originals: [ file ]
      }
    end
    r = HomologationRequest.last
    assert_equal 1, r.originals.count
    assert_equal "test_document.pdf", r.originals.first.filename.to_s
  end

  test "create without files still succeeds" do
    sign_in @student
    assert_difference "HomologationRequest.count", 1 do
      post homologation_requests_path, params: {
        subject: "No files", service_type: "equivalencia", privacy_accepted: true
      }
    end
    r = HomologationRequest.last
    refute r.application.attached?
    assert_equal 0, r.originals.count
    assert_equal 0, r.documents.count
  end

  # === Update: status transitions ===

  test "super_admin can change status" do
    sign_in @admin
    patch homologation_request_path(@submitted_request), params: { status: "in_review" }
    assert_redirected_to homologation_request_path(@submitted_request)
    assert_equal "in_review", @submitted_request.reload.status
  end

  test "coordinator cannot change status" do
    sign_in @coordinator
    patch homologation_request_path(@submitted_request), params: { status: "in_review" }
    assert_response :forbidden
    assert_equal "submitted", @submitted_request.reload.status
  end

  test "student cannot update status" do
    sign_in @student
    patch homologation_request_path(@submitted_request), params: { status: "in_review" }
    assert_response :forbidden
  end

  test "invalid status transition returns redirect with alert" do
    sign_in @admin
    patch homologation_request_path(@submitted_request), params: { status: "resolved" }
    assert_response :redirect
    assert flash[:alert].present?, "Expected flash alert for invalid transition"
    assert_equal "submitted", @submitted_request.reload.status
  end

  # === Update: field changes ===

  test "super_admin can update draft fields" do
    sign_in @admin
    patch homologation_request_path(@draft_request), params: {
      subject: "Updated subject", education_system: "colombia"
    }
    assert_redirected_to homologation_request_path(@draft_request)
    @draft_request.reload
    assert_equal "Updated subject", @draft_request.subject
    assert_equal "colombia", @draft_request.education_system
    assert_equal "draft", @draft_request.status
  end

  test "super_admin can transition draft to submitted" do
    sign_in @admin
    @draft_request.update!(privacy_accepted: true)
    patch homologation_request_path(@draft_request), params: { status: "submitted" }
    assert_redirected_to homologation_request_path(@draft_request)
    assert_equal "submitted", @draft_request.reload.status
  end

  test "student cannot update own draft (policy restricts update to super_admin)" do
    sign_in @student
    patch homologation_request_path(@draft_request), params: { subject: "Hacked" }
    assert_response :forbidden
    assert_equal @draft_request.subject, @draft_request.reload.subject
  end

  test "super_admin update with blank subject returns error" do
    sign_in @admin
    patch homologation_request_path(@submitted_request), params: { subject: "" }
    assert_response :redirect
    assert_not_equal "", @submitted_request.reload.subject
  end

  # === Confirm payment ===

  test "super_admin can confirm payment" do
    sign_in @admin
    @submitted_request.update!(status: "awaiting_payment")
    post confirm_payment_homologation_request_path(@submitted_request), params: { payment_amount: 60 }
    assert_redirected_to homologation_request_path(@submitted_request)
    assert_equal "payment_confirmed", @submitted_request.reload.status
    assert_equal 60.0, @submitted_request.reload.payment_amount.to_f
  end

  test "coordinator cannot confirm payment" do
    sign_in @coordinator
    @submitted_request.update!(status: "awaiting_payment")
    post confirm_payment_homologation_request_path(@submitted_request), params: { payment_amount: 60 }
    assert_response :forbidden
  end

  test "student cannot confirm payment" do
    sign_in @student
    @submitted_request.update!(status: "awaiting_payment")
    post confirm_payment_homologation_request_path(@submitted_request), params: { payment_amount: 60 }
    assert_response :forbidden
  end

  test "confirm payment with empty amount is rejected with alert" do
    sign_in @admin
    request = awaiting_payment_request
    post confirm_payment_homologation_request_path(request), params: { payment_amount: "" }
    assert_response :redirect
    assert flash[:alert].present?, "Expected flash alert for missing amount"
    assert_equal "awaiting_payment", request.reload.status
  end

  test "confirm payment with zero amount is rejected with alert" do
    sign_in @admin
    request = awaiting_payment_request
    post confirm_payment_homologation_request_path(request), params: { payment_amount: 0 }
    assert_response :redirect
    assert flash[:alert].present?, "Expected flash alert for zero amount"
    assert_equal "awaiting_payment", request.reload.status
  end

  test "confirm payment with valid amount succeeds" do
    sign_in @admin
    request = awaiting_payment_request
    post confirm_payment_homologation_request_path(request), params: { payment_amount: 150 }
    assert_redirected_to homologation_request_path(request)
    assert_equal "payment_confirmed", request.reload.status
    assert_equal 150.0, request.payment_amount.to_f
  end

  test "payment confirmation triggers AmoCRM sync job" do
    sign_in @admin
    request = awaiting_payment_request
    assert_enqueued_with(job: AmoCrmSyncJob) do
      post confirm_payment_homologation_request_path(request), params: { payment_amount: 150 }
    end
  end

  test "double confirm payment — second attempt fails gracefully" do
    sign_in @admin
    request = awaiting_payment_request
    post confirm_payment_homologation_request_path(request), params: { payment_amount: 100 }
    assert_equal "payment_confirmed", request.reload.status

    post confirm_payment_homologation_request_path(request), params: { payment_amount: 200 }
    assert_response :forbidden
    assert_equal 100.0, request.reload.payment_amount.to_f
  end

  # === Stripe checkout session ===

  test "super_admin can create checkout session" do
    sign_in @admin
    request = awaiting_payment_request

    mock_session = OpenStruct.new(id: "cs_test_123", url: "https://checkout.stripe.com/test")
    mock_customer = OpenStruct.new(id: "cus_test_123")

    original_customer_create = Stripe::Customer.method(:create)
    original_session_create = Stripe::Checkout::Session.method(:create)
    Stripe::Customer.define_singleton_method(:create) { |**_| mock_customer }
    Stripe::Checkout::Session.define_singleton_method(:create) { |**_| mock_session }

    post create_checkout_session_homologation_request_path(request),
      params: { payment_amount: 100 }

    assert_redirected_to homologation_request_path(request)
    assert_equal "https://checkout.stripe.com/test", flash[:stripe_url]
  ensure
    Stripe::Customer.define_singleton_method(:create, original_customer_create)
    Stripe::Checkout::Session.define_singleton_method(:create, original_session_create)
  end

  test "student cannot create checkout session" do
    sign_in @student
    @submitted_request.update!(status: "awaiting_payment")
    post create_checkout_session_homologation_request_path(@submitted_request),
      params: { payment_amount: 100 }
    assert_response :forbidden
  end

  test "coordinator cannot create checkout session" do
    sign_in @coordinator
    @submitted_request.update!(status: "awaiting_payment")
    post create_checkout_session_homologation_request_path(@submitted_request),
      params: { payment_amount: 100 }
    assert_response :forbidden
  end

  # === AmoCRM retry ===

  test "super_admin can retry AmoCRM sync" do
    sign_in @admin
    @submitted_request.update!(status: "payment_confirmed", payment_amount: 100, amo_crm_sync_error: "API timeout")

    post retry_sync_homologation_request_path(@submitted_request)
    assert_redirected_to homologation_request_path(@submitted_request)
    assert_nil @submitted_request.reload.amo_crm_sync_error
  end

  test "coordinator cannot retry AmoCRM sync" do
    sign_in @coordinator
    @submitted_request.update!(status: "payment_confirmed", payment_amount: 100, amo_crm_sync_error: "API timeout")

    post retry_sync_homologation_request_path(@submitted_request)
    assert_response :forbidden
  end

  test "student cannot retry AmoCRM sync" do
    sign_in @student
    @submitted_request.update!(status: "payment_confirmed", payment_amount: 100, amo_crm_sync_error: "API timeout")

    post retry_sync_homologation_request_path(@submitted_request)
    assert_response :forbidden
  end

  # === Show: props structure ===

  EXPECTED_SHOW_KEYS = %i[
    id subject serviceType status description identityCard passport
    educationSystem studiesFinished studyTypeSpain studiesSpain
    university languageKnowledge languageCertificate
    paymentAmount paymentConfirmedAt amoCrmLeadId amoCrmSyncedAt amoCrmSyncError
    createdAt updatedAt user conversation files
  ].freeze

  test "show props contain all keys expected by RequestDetail TS interface" do
    sign_in @admin
    get homologation_request_path(@submitted_request)
    assert_response :ok

    props = inertia.props[:request]
    EXPECTED_SHOW_KEYS.each do |key|
      assert props.key?(key), "Missing key :#{key} in show props"
    end
  end

  test "show props user has id, name, email" do
    sign_in @admin
    get homologation_request_path(@submitted_request)

    user_props = inertia.props[:request][:user]
    assert_equal @submitted_request.user.id, user_props[:id]
    assert_equal @submitted_request.user.name, user_props[:name]
    assert_equal @submitted_request.user.email_address, user_props[:email]
  end

  test "show props dates are ISO 8601 strings" do
    sign_in @admin
    get homologation_request_path(@submitted_request)

    props = inertia.props[:request]
    assert_match(/\d{4}-\d{2}-\d{2}T/, props[:createdAt])
    assert_match(/\d{4}-\d{2}-\d{2}T/, props[:updatedAt])
  end

  test "show props files is an array" do
    sign_in @admin
    get homologation_request_path(@submitted_request)
    assert_kind_of Array, inertia.props[:request][:files]
  end

  test "show props include file details when files attached" do
    sign_in @admin
    request = request_with_file
    get homologation_request_path(request)

    files = inertia.props[:request][:files]
    assert_equal 1, files.size
    assert_equal "diploma.pdf", files.first[:filename]
    assert_equal "originals", files.first[:category]
    assert files.first[:id].present?
    assert files.first[:byteSize].positive?
  end

  # === Show: special cases ===

  test "super_admin is added as conversation participant on show" do
    sign_in @admin
    conv = @submitted_request.conversation

    get homologation_request_path(@submitted_request)
    assert_includes conv.participants, @admin
  end

  test "submitted request auto-creates conversation" do
    sign_in @student
    assert_difference "Conversation.count", 1 do
      post homologation_requests_path, params: {
        subject: "With conversation", service_type: "equivalencia",
        privacy_accepted: true
      }
    end
    new_request = HomologationRequest.last
    assert_not_nil new_request.conversation
    assert_includes new_request.conversation.participants, @student
  end

  test "draft request does not create conversation" do
    sign_in @student
    assert_no_difference "Conversation.count" do
      post homologation_requests_path, params: {
        commit: "draft",
        subject: "Draft only", service_type: "equivalencia"
      }
    end
  end

  test "student can view own draft — conversation is nil" do
    sign_in @student
    get homologation_request_path(@draft_request)
    assert_response :ok
    assert_equal "requests/Show", inertia.component
    assert_nil inertia.props[:request][:conversation]
  end

  # === Soft delete ===

  test "soft-deleted request is not accessible via show" do
    sign_in @student
    @submitted_request.discard

    get homologation_request_path(@submitted_request)
    assert_response :not_found
  end

  # === File download ===

  test "student can download own file" do
    sign_in @student
    request = request_with_file
    get download_document_homologation_request_path(request, document_id: request.originals.first.blob.id)
    assert_response :redirect
  end

  test "student cannot download file from another student request" do
    sign_in @other_student
    request = request_with_file
    get download_document_homologation_request_path(request, document_id: request.originals.first.blob.id)
    assert_response :forbidden
  end

  test "super_admin can download any file" do
    sign_in @admin
    request = request_with_file
    get download_document_homologation_request_path(request, document_id: request.originals.first.blob.id)
    assert_response :redirect
  end

  # === Download all (archive) ===

  test "super_admin downloads all documents as zip" do
    sign_in @admin
    request = request_with_all_categories
    get download_all_homologation_request_path(request)

    assert_response :ok
    assert_equal "application/zip", response.media_type

    entries = unzip_entries(response.body)
    assert_includes entries, "README.txt"
    assert_includes entries, "01_application/form.pdf"
    assert_includes entries, "02_originals/diploma.pdf"
    assert_includes entries, "03_documents/translation.pdf"
  end

  test "student owner can download own archive" do
    sign_in @student
    request = request_with_all_categories
    get download_all_homologation_request_path(request)
    assert_response :ok
    assert_equal "application/zip", response.media_type
  end

  test "other student cannot download archive" do
    sign_in @other_student
    request = request_with_all_categories
    get download_all_homologation_request_path(request)
    assert_response :forbidden
  end

  test "archive contains only categories that have files" do
    sign_in @admin
    @submitted_request.documents.attach(
      io: File.open(file_fixture("test_document.pdf")),
      filename: "translation.pdf",
      content_type: "application/pdf"
    )
    get download_all_homologation_request_path(@submitted_request)

    entries = unzip_entries(response.body)
    assert_includes entries, "README.txt"
    assert_includes entries, "03_documents/translation.pdf"
    refute(entries.any? { |e| e.start_with?("01_application/") }, "unexpected 01_application/ entries: #{entries}")
    refute(entries.any? { |e| e.start_with?("02_originals/") }, "unexpected 02_originals/ entries: #{entries}")
  end

  test "archive filename is transliterated to ASCII and includes request id" do
    sign_in @admin
    @student.update!(name: "Иван Петров")
    request = request_with_all_categories

    get download_all_homologation_request_path(request)
    disposition = response.headers["Content-Disposition"]
    filename = disposition[/filename="?([^";]+)"?/, 1]

    assert_match(/\AIvan_Petrov_Request_#{request.id}\.zip\z/, filename,
      "Expected Ivan_Petrov_Request_#{request.id}.zip, got #{filename.inspect}")
    assert filename.ascii_only?, "Filename must be ASCII-only: #{filename.inspect}"
  end

  test "archive README contains student name, email, request id, service type, status, submitted date" do
    sign_in @admin
    request = request_with_all_categories

    get download_all_homologation_request_path(request)
    readme = read_zip_entry(response.body, "README.txt")

    assert_includes readme, request.user.name
    assert_includes readme, request.user.email_address
    assert_includes readme, request.id.to_s
    assert_includes readme, request.service_type
    assert_includes readme, request.status
    assert_match(/\d{4}-\d{2}-\d{2}/, readme, "README should include submission date")
  end

  test "request with zero files returns zip with README only" do
    sign_in @admin
    get download_all_homologation_request_path(@submitted_request)
    assert_response :ok
    entries = unzip_entries(response.body)
    assert_equal [ "README.txt" ], entries
  end

  test "archive preserves exact byte content of uploaded files" do
    sign_in @admin
    path = file_fixture("test_document.pdf")
    source_bytes = File.binread(path)
    @submitted_request.originals.attach(
      io: File.open(path),
      filename: "diploma.pdf",
      content_type: "application/pdf"
    )
    get download_all_homologation_request_path(@submitted_request)

    extracted = nil
    Zip::File.open_buffer(StringIO.new(response.body)) do |zip|
      extracted = zip.find_entry("02_originals/diploma.pdf").get_input_stream.read
    end
    assert_equal source_bytes.bytesize, extracted.bytesize
    assert_equal source_bytes, extracted.b
  end

  private

  # Shared setup helpers — reduce duplication in tests

  def awaiting_payment_request
    @submitted_request.update!(status: "awaiting_payment")
    @submitted_request
  end

  def request_with_file
    @submitted_request.originals.attach(
      io: File.open(file_fixture("test_document.pdf")),
      filename: "diploma.pdf",
      content_type: "application/pdf"
    )
    @submitted_request
  end

  def request_with_all_categories
    r = @submitted_request
    r.application.attach(
      io: File.open(file_fixture("test_document.pdf")),
      filename: "form.pdf",
      content_type: "application/pdf"
    )
    r.originals.attach(
      io: File.open(file_fixture("test_document.pdf")),
      filename: "diploma.pdf",
      content_type: "application/pdf"
    )
    r.documents.attach(
      io: File.open(file_fixture("test_document.pdf")),
      filename: "translation.pdf",
      content_type: "application/pdf"
    )
    r
  end

  def unzip_entries(body)
    entries = []
    Zip::File.open_buffer(StringIO.new(body)) do |zip|
      zip.each { |e| entries << e.name }
    end
    entries.sort
  end

  def read_zip_entry(body, name)
    Zip::File.open_buffer(StringIO.new(body)) do |zip|
      entry = zip.find_entry(name)
      return entry.get_input_stream.read.force_encoding("UTF-8")
    end
  end
end
