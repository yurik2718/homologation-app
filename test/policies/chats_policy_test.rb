require "test_helper"

class ChatsPolicyTest < ActiveSupport::TestCase
  test "coordinator can access chats" do
    policy = ChatsPolicy.new(users(:coordinator_maria), :chats)
    assert policy.index?
    assert policy.show?
  end

  test "super_admin can access chats" do
    assert ChatsPolicy.new(users(:super_admin_boss), :chats).index?
  end

  test "student cannot access chats" do
    policy = ChatsPolicy.new(users(:student_ana), :chats)
    refute policy.index?
    refute policy.show?
  end

  test "teacher cannot access chats" do
    refute ChatsPolicy.new(users(:teacher_ivan), :chats).index?
  end
end
