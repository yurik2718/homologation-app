require "test_helper"

class MessagesControllerTest < ActionDispatch::IntegrationTest
  test "student can send message in own request conversation" do
    sign_in users(:student_ana)
    assert_difference "Message.count", 1 do
      post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
           params: { body: "Hello coordinator" }
    end
  end

  test "coordinator can send message in any request conversation" do
    sign_in users(:coordinator_maria)
    assert_difference "Message.count", 1 do
      post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
           params: { body: "I'll review your documents" }
    end
  end

  test "unauthorized student cannot send message in other's request" do
    sign_in users(:student_pedro)
    assert_no_difference "Message.count" do
      post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
           params: { body: "Hacking attempt" }
    end
    assert_response :forbidden
  end

  test "empty body does not create message" do
    sign_in users(:student_ana)
    assert_no_difference "Message.count" do
      post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
           params: { body: "" }
    end
  end

  test "teacher can send message in teacher-student conversation" do
    sign_in users(:teacher_ivan)
    assert_difference "Message.count", 1 do
      post conversation_messages_path(conversations(:ivan_ana_conversation)),
           params: { body: "Ready for our lesson?" }
    end
  end

  test "student can send message in teacher-student conversation" do
    sign_in users(:student_ana)
    assert_difference "Message.count", 1 do
      post conversation_messages_path(conversations(:ivan_ana_conversation)),
           params: { body: "Yes, I'm ready!" }
    end
  end

  test "unrelated student cannot send message in teacher-student conversation" do
    sign_in users(:student_pedro)
    assert_no_difference "Message.count" do
      post conversation_messages_path(conversations(:ivan_ana_conversation)),
           params: { body: "Not my conversation" }
    end
    assert_response :forbidden
  end
end
