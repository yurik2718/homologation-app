require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  # --- Smart redirect: students ---

  test "student with only homologation is redirected to requests" do
    sign_in users(:student_ana) # has_homologation: true, has_education: false
    get dashboard_path
    assert_redirected_to homologation_requests_path
  end

  test "student with only education is redirected to lessons" do
    user = users(:student_ana)
    user.update!(has_homologation: false, has_education: true)
    sign_in user
    get dashboard_path
    assert_redirected_to lessons_path
  end

  test "student with both cabinets sees dashboard" do
    user = users(:student_ana)
    user.update!(has_homologation: true, has_education: true)
    sign_in user
    get dashboard_path
    assert_response :ok
    assert_equal "dashboard/Index", inertia.component
  end

  # --- Smart redirect: coordinators ---

  test "coordinator with homologation is redirected to chats" do
    sign_in users(:coordinator_maria) # has_homologation: true, has_education: false
    get dashboard_path
    assert_redirected_to chats_path
  end

  test "coordinator with only education is redirected to teachers" do
    user = users(:coordinator_maria)
    user.update!(has_homologation: false, has_education: true)
    sign_in user
    get dashboard_path
    assert_redirected_to teachers_path
  end

  test "coordinator with both cabinets is redirected to teachers" do
    user = users(:coordinator_maria)
    user.update!(has_homologation: true, has_education: true)
    sign_in user
    get dashboard_path
    assert_redirected_to teachers_path
  end

  # --- Smart redirect: teachers & admin ---

  test "teacher is redirected to lessons" do
    sign_in users(:teacher_ivan) # has_education: true, has_homologation: false
    get dashboard_path
    assert_redirected_to lessons_path
  end

  test "super_admin sees dashboard" do
    sign_in users(:super_admin_boss) # both cabinets
    get dashboard_path
    assert_response :ok
    assert_equal "dashboard/Index", inertia.component
  end

  test "unauthenticated redirects to login" do
    get dashboard_path
    assert_redirected_to new_session_path
  end

  # --- Features flags: cabinet ---

  test "features include hasHomologation true for homologation student" do
    user = users(:student_ana)
    user.update!(has_homologation: true, has_education: true)
    sign_in user
    get dashboard_path
    assert_equal true, inertia.props[:features][:hasHomologation]
  end

  test "features include hasEducation true for teacher" do
    sign_in users(:teacher_ivan)
    get lessons_path
    assert_equal true, inertia.props[:features][:hasEducation]
    assert_equal false, inertia.props[:features][:hasHomologation]
  end

  test "features include both flags true for super admin" do
    sign_in users(:super_admin_boss)
    get dashboard_path
    assert_equal true, inertia.props[:features][:hasHomologation]
    assert_equal true, inertia.props[:features][:hasEducation]
  end
end
