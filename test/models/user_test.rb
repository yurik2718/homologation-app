require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal "downcased@example.com", user.email_address
  end

  test "role check methods work" do
    assert users(:super_admin_boss).super_admin?
    assert users(:coordinator_maria).coordinator?
    assert users(:teacher_ivan).teacher?
    assert users(:student_ana).student?
    refute users(:student_ana).coordinator?
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
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "99999",
      info: { email: users(:student_ana).email_address, name: "Ana", image: nil }
    )
    user = User.find_or_create_from_oauth(auth)
    assert_equal users(:student_ana).id, user.id
  end

  test "profile_complete? returns true when all fields present" do
    assert users(:student_ana).profile_complete?
  end

  test "profile_complete? returns false when whatsapp missing" do
    user = users(:student_ana)
    user.whatsapp = nil
    refute user.profile_complete?
  end

  test "profile_complete? returns false when birthday missing" do
    user = users(:student_ana)
    user.birthday = nil
    refute user.profile_complete?
  end

  test "profile_complete? returns false when country missing" do
    user = users(:student_ana)
    user.country = nil
    refute user.profile_complete?
  end

  test "soft delete discard and kept scopes" do
    user = users(:student_ana)
    assert_includes User.kept, user
    user.discard
    refute_includes User.kept.reload, user
    assert_includes User.discarded, user
  end

  test "undiscard restores user to kept" do
    user = users(:student_pedro)
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

  # --- Dual cabinet ---

  test "homologation_cabinet? returns true when has_homologation is true" do
    user = users(:student_ana)
    user.has_homologation = true
    assert user.homologation_cabinet?
  end

  test "homologation_cabinet? returns false when has_homologation is false" do
    user = users(:student_ana)
    user.has_homologation = false
    user.has_education = true
    refute user.homologation_cabinet?
  end

  test "education_cabinet? returns true when has_education is true" do
    user = users(:teacher_ivan)
    user.has_education = true
    assert user.education_cabinet?
  end

  test "education_cabinet? returns false when has_education is false" do
    user = users(:student_ana)
    user.has_education = false
    refute user.education_cabinet?
  end

  test "user with both cabinets is valid" do
    user = users(:student_ana)
    user.has_homologation = true
    user.has_education = true
    assert user.valid?
  end

  test "user must have at least one cabinet" do
    user = users(:student_ana)
    user.has_homologation = false
    user.has_education = false
    refute user.valid?
    assert user.errors[:base].any?
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
