require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal "downcased@example.com", user.email_address
  end

  test "role check methods work" do
    assert create(:user, :super_admin).super_admin?
    assert create(:user, :coordinator).coordinator?
    assert create(:user, :teacher).teacher?
    student = create(:user, :student)
    assert student.student?
    refute student.coordinator?
  end

  test "find_or_create_from_oauth creates new user" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "12345",
      info: { email: "new@example.com", name: "New User", image: nil }
    )
    user = User.find_or_create_from_oauth(auth)
    assert user.persisted?
    assert user.student?
    assert_equal "new@example.com", user.email_address
  end

  test "find_or_create_from_oauth finds existing by email" do
    existing = create(:user, :student)
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "99999",
      info: { email: existing.email_address, name: "Ana", image: nil }
    )
    user = User.find_or_create_from_oauth(auth)
    assert_equal existing.id, user.id
  end

  test "profile_complete? returns true when all fields present" do
    assert create(:user, :student).profile_complete?
  end

  test "profile_complete? returns false when whatsapp missing" do
    user = create(:user, :student)
    user.whatsapp = nil
    refute user.profile_complete?
  end

  test "profile_complete? returns false when birthday missing" do
    user = create(:user, :student)
    user.birthday = nil
    refute user.profile_complete?
  end

  test "profile_complete? returns false when country missing" do
    user = create(:user, :student)
    user.country = nil
    refute user.profile_complete?
  end

  test "soft delete discard and kept scopes" do
    user = create(:user, :student)
    assert_includes User.kept, user
    user.discard
    refute_includes User.kept.reload, user
    assert_includes User.discarded, user
  end

  test "undiscard restores user to kept" do
    user = create(:user, :student)
    user.discard
    user.undiscard
    assert_includes User.kept, user
    refute user.discarded?
  end

  test "name is required" do
    user = User.new(email_address: "test@example.com", password: "password123", name: "")
    refute user.valid?
    assert user.errors[:name].any?
  end

  test "email_address is required" do
    user = User.new(name: "Test", password: "password123")
    refute user.valid?
    assert user.errors[:email_address].any?
  end

  test "password validation for email users" do
    user = User.new(email_address: "short@example.com", password: "short", name: "Test")
    refute user.valid?
    assert user.errors[:password].any?
  end

  test "OAuth user is created via find_or_create_from_oauth with student role" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "oauthuid123",
      info: { email: "oauth@example.com", name: "OAuth User", image: "https://example.com/pic.jpg" }
    )
    user = User.find_or_create_from_oauth(auth)
    assert user.persisted?
    assert user.student?
    assert_equal "google_oauth2", user.provider
  end

  # --- Role scopes ---

  test ".teachers returns only users with teacher role" do
    teacher = create(:user, :teacher)
    create(:user, :student)
    assert_includes User.teachers, teacher
    assert_equal User.teachers.count, User.teachers.distinct.count
  end

  test ".students returns only users with student role" do
    create(:user, :teacher)
    student = create(:user, :student)
    assert_includes User.students, student
    refute_includes User.students, User.teachers.first
  end

  test ".super_admins returns only super_admin users" do
    admin = create(:user, :super_admin)
    create(:user, :student)
    assert_includes User.super_admins, admin
  end

  test ".coordinators returns only coordinator users" do
    coord = create(:user, :coordinator)
    create(:user, :student)
    assert_includes User.coordinators, coord
  end

  test "role scopes do not duplicate users with multiple roles" do
    user = create(:user, :teacher)
    user.roles << Role.find_by!(name: "coordinator")
    assert_equal 1, User.teachers.where(id: user.id).count
    assert_equal 1, User.coordinators.where(id: user.id).count
  end

  # --- Dual cabinet ---

  test "homologation_cabinet? returns true when has_homologation is true" do
    user = create(:user, :student)
    user.has_homologation = true
    assert user.homologation_cabinet?
  end

  test "homologation_cabinet? returns false when has_homologation is false" do
    user = create(:user, :student)
    user.has_homologation = false
    user.has_education = true
    refute user.homologation_cabinet?
  end

  test "education_cabinet? returns true when has_education is true" do
    user = create(:user, :teacher)
    user.has_education = true
    assert user.education_cabinet?
  end

  test "education_cabinet? returns false when has_education is false" do
    user = create(:user, :student)
    user.has_education = false
    refute user.education_cabinet?
  end

  test "user with both cabinets is valid" do
    user = create(:user, :student)
    user.has_homologation = true
    user.has_education = true
    assert user.valid?
  end

  test "user must have at least one cabinet" do
    user = create(:user, :student)
    user.has_homologation = false
    user.has_education = false
    refute user.valid?
    assert user.errors[:base].any?
  end

  # --- gdpr_anonymize! ---

  test "gdpr_anonymize! clears all PII fields" do
    user = create(:user, :student)
    user.gdpr_anonymize!
    user.reload

    assert_equal "Deleted User ##{user.id}", user.name
    assert_equal "deleted_#{user.id}@gdpr.invalid", user.email_address
    assert_nil user.phone
    assert_nil user.whatsapp
    assert_nil user.birthday
    assert_nil user.country
    assert_nil user.guardian_name
    assert_nil user.guardian_email
    assert_nil user.guardian_phone
    assert_nil user.guardian_whatsapp
    assert_nil user.avatar_url
    assert_nil user.provider
    assert_nil user.uid
    assert_nil user.telegram_chat_id
    assert_nil user.telegram_link_token
    assert_nil user.amo_crm_contact_id
    assert_nil user.stripe_customer_id
  end

  test "gdpr_anonymize! discards the user" do
    user = create(:user, :student)
    refute user.discarded?
    user.gdpr_anonymize!
    assert user.reload.discarded?
  end

  test "gdpr_anonymize! destroys all sessions" do
    user = create(:user, :student)
    user.sessions.create!
    user.sessions.create!
    assert_equal 2, user.sessions.count
    user.gdpr_anonymize!
    assert_equal 0, user.sessions.count
  end

  test "gdpr_anonymize! invalidates password" do
    user = create(:user, :student)
    original_digest = user.password_digest
    user.gdpr_anonymize!
    refute_equal original_digest, user.reload.password_digest
  end

  test "gdpr_anonymize! makes email unique per user id" do
    user1 = create(:user, :student)
    user2 = create(:user, :student)
    user1.gdpr_anonymize!
    user2.gdpr_anonymize!
    refute_equal user1.reload.email_address, user2.reload.email_address
  end

  test "gdpr_anonymize! prevents the user from logging in" do
    password = "password123"
    user = build(:user, :student, password: password)
    user.save!
    user.gdpr_anonymize!
    # password_digest is set to a random hex string (not a valid BCrypt hash),
    # so authenticate raises or returns false — either way login is impossible
    authenticated = begin
      user.reload.authenticate(password)
    rescue BCrypt::Errors::InvalidHash
      false
    end
    assert_equal false, authenticated
  end

  # --- purge_everything! ---

  test "purge_everything! destroys the user record" do
    user = create(:user, :student)
    user_id = user.id
    user.purge_everything!
    assert_nil User.find_by(id: user_id)
  end

  test "purge_everything! destroys the user's homologation requests" do
    user = create(:user, :student)
    create(:homologation_request, :submitted, user: user)
    create(:homologation_request, :submitted, user: user)
    user.purge_everything!
    assert_equal 0, HomologationRequest.where(user_id: user.id).count
  end

  test "purge_everything! nulls out teacher_student assigner references" do
    coordinator = create(:user, :coordinator)
    teacher = create(:user, :teacher)
    student = create(:user, :student)
    ts = create(:teacher_student, teacher: teacher, student: student, assigned_by: coordinator.id)
    coordinator.purge_everything!
    assert_nil ts.reload.assigned_by
  end

  test "purge_everything! preserves teacher-student link when coordinator is purged" do
    coordinator = create(:user, :coordinator)
    teacher = create(:user, :teacher)
    student = create(:user, :student)
    ts = create(:teacher_student, teacher: teacher, student: student, assigned_by: coordinator.id)
    coordinator.purge_everything!
    assert TeacherStudent.exists?(ts.id)
  end

  test "purge_everything! nulls out payment_confirmed_by references" do
    coordinator = create(:user, :coordinator)
    student = create(:user, :student)
    request = create(:homologation_request, :payment_confirmed, user: student)
    request.update_columns(payment_confirmed_by: coordinator.id)
    coordinator.purge_everything!
    assert_nil request.reload.payment_confirmed_by
  end

  test "purge_everything! nulls out status_changed_by references" do
    coordinator = create(:user, :coordinator)
    student = create(:user, :student)
    request = create(:homologation_request, :submitted, user: student)
    request.update_columns(status_changed_by: coordinator.id)
    coordinator.purge_everything!
    assert_nil request.reload.status_changed_by
  end

  test "purge_everything! destroys messages by user in other conversations" do
    coordinator = create(:user, :coordinator)
    student = create(:user, :student)
    hr = create(:homologation_request, :submitted, :with_conversation, user: student)
    conv = hr.conversation
    conv.conversation_participants.create!(user: coordinator)
    message = conv.messages.create!(user: coordinator, body: "hello")
    coordinator.purge_everything!
    assert_nil Message.find_by(id: message.id)
  end

  test "purge_everything! removes conversation participant records for other users chats" do
    coordinator = create(:user, :coordinator)
    student = create(:user, :student)
    hr = create(:homologation_request, :submitted, :with_conversation, user: student)
    conv = hr.conversation
    participant = conv.conversation_participants.create!(user: coordinator)
    coordinator.purge_everything!
    assert_nil ConversationParticipant.find_by(id: participant.id)
  end

  # --- purgeable? ---

  test "purgeable? returns true when user has no requests" do
    user = create(:user, :student)
    assert user.purgeable?
  end

  test "purgeable? returns true when all requests are draft/resolved/closed" do
    user = create(:user, :student)
    create(:homologation_request, :draft, user: user)
    assert user.purgeable?
  end

  test "purgeable? returns false when user has in-progress requests" do
    user = create(:user, :student)
    create(:homologation_request, :submitted, user: user)
    refute user.purgeable?
  end

  test "purgeable? returns false for in_review status" do
    user = create(:user, :student)
    r = create(:homologation_request, :submitted, user: user)
    r.update_columns(status: "in_review")
    refute user.purgeable?
  end

  test "purgeable? returns false for payment_confirmed status" do
    user = create(:user, :student)
    create(:homologation_request, :payment_confirmed, user: user)
    refute user.purgeable?
  end

  test "purgeable? returns false for in_progress status" do
    user = create(:user, :student)
    r = create(:homologation_request, :payment_confirmed, user: user)
    r.update_columns(status: "in_progress")
    refute user.purgeable?
  end

  test "purgeable? returns true for resolved requests" do
    user = create(:user, :student)
    r = create(:homologation_request, :payment_confirmed, user: user)
    r.update_columns(status: "resolved")
    assert user.purgeable?
  end

  test "purgeable? returns true for closed requests" do
    user = create(:user, :student)
    r = create(:homologation_request, :payment_confirmed, user: user)
    r.update_columns(status: "closed")
    assert user.purgeable?
  end

  test "purgeable? returns false when any request is non-purgeable even if others are closed" do
    user = create(:user, :student)
    r1 = create(:homologation_request, :payment_confirmed, user: user)
    r1.update_columns(status: "resolved")
    create(:homologation_request, :submitted, user: user)
    refute user.purgeable?
  end

  # --- schedule_purge! ---

  test "schedule_purge! sets purge_scheduled_at" do
    user = create(:user, :student)
    freeze_time do
      user.schedule_purge!
      assert_equal Time.current, user.reload.purge_scheduled_at
    end
  end

  test "schedule_purge! sets purge_scheduled_at on the record" do
    user = create(:user, :student)
    refute user.purge_scheduled_at?
    user.schedule_purge!
    assert user.reload.purge_scheduled_at?
  end

  test "cancel_purge! clears purge_scheduled_at" do
    user = create(:user, :student)
    user.update!(purge_scheduled_at: Time.current)
    user.cancel_purge!
    assert_nil user.reload.purge_scheduled_at
  end

  # --- purge_stats ---

  test "purge_stats returns request and file counts" do
    user = create(:user, :student)
    create(:homologation_request, :submitted, user: user)
    create(:homologation_request, :submitted, user: user)
    stats = user.purge_stats
    assert_equal 2, stats[:requests]
    assert_kind_of Integer, stats[:files]
  end

  test "new student via OAuth gets has_homologation true by default" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "newstudent999",
      info: { email: "newstudent@example.com", name: "New Student", image: nil }
    )
    user = User.find_or_create_from_oauth(auth)
    assert user.has_homologation?
    refute user.has_education?
  end
end
