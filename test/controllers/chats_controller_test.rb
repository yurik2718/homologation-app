require "test_helper"

class ChatsControllerTest < ActionDispatch::IntegrationTest
  test "coordinator can access chats" do
    sign_in users(:coordinator_maria)
    get chats_path
    assert_response :ok
    assert_equal "chats/Index", inertia.component
  end

  test "super_admin can access chats" do
    sign_in users(:super_admin_boss)
    get chats_path
    assert_response :ok
    assert_equal "chats/Index", inertia.component
  end

  test "student cannot access chats" do
    sign_in users(:student_ana)
    get chats_path
    assert_response :forbidden
  end

  test "teacher cannot access chats" do
    sign_in users(:teacher_ivan)
    get chats_path
    assert_response :forbidden
  end

  test "coordinator can view conversation in chats" do
    sign_in users(:coordinator_maria)
    get chat_path(conversations(:ana_equivalencia_conversation))
    assert_response :ok
    assert_equal "chats/Index", inertia.component
  end

  test "chats index includes conversations list" do
    sign_in users(:coordinator_maria)
    get chats_path
    assert_response :ok
    props = inertia.props
    assert props[:conversations].is_a?(Array)
  end
end
