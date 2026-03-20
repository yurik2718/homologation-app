require "test_helper"

class LessonsControllerTest < ActionDispatch::IntegrationTest
  test "teacher sees own calendar" do
    sign_in users(:teacher_ivan)
    get lessons_path
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "student sees own lessons" do
    sign_in users(:student_ana)
    get lessons_path
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "coordinator redirects to admin lessons" do
    sign_in users(:coordinator_maria)
    get lessons_path
    assert_redirected_to admin_lessons_path
  end

  test "super_admin redirects to admin lessons" do
    sign_in users(:super_admin_boss)
    get lessons_path
    assert_redirected_to admin_lessons_path
  end

  test "teacher can create lesson for assigned student" do
    sign_in users(:teacher_ivan)
    assert_difference "Lesson.count", 1 do
      post lessons_path, params: {
        lesson: { student_id: users(:student_ana).id, scheduled_at: 1.week.from_now,
                  duration_minutes: 60 }
      }
    end
    assert_redirected_to lesson_path(Lesson.last)
  end

  test "teacher cannot create lesson for non-assigned student" do
    sign_in users(:teacher_ivan)
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { student_id: users(:student_pedro).id, scheduled_at: 1.week.from_now,
                  duration_minutes: 60 }
      }
    end
  end

  test "cannot create lesson in the past" do
    sign_in users(:teacher_ivan)
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { student_id: users(:student_ana).id, scheduled_at: 1.day.ago,
                  duration_minutes: 60 }
      }
    end
  end

  test "teacher can mark lesson completed" do
    sign_in users(:teacher_ivan)
    lesson = lessons(:ivan_ana_lesson)
    patch lesson_path(lesson), params: { lesson: { status: "completed", notes: "Good progress" } }
    assert_redirected_to lesson_path(lesson)
    assert_equal "completed", lesson.reload.status
    assert_equal "Good progress", lesson.reload.notes
  end

  test "student cannot create lessons" do
    sign_in users(:student_ana)
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { teacher_id: users(:teacher_ivan).id, student_id: users(:student_ana).id,
                  scheduled_at: 1.week.from_now, duration_minutes: 60 }
      }
    end
    assert_response :forbidden
  end

  test "teacher can show lesson" do
    sign_in users(:teacher_ivan)
    get lesson_path(lessons(:ivan_ana_lesson))
    assert_response :ok
  end

  test "student can show own lesson" do
    sign_in users(:student_ana)
    get lesson_path(lessons(:ivan_ana_lesson))
    assert_response :ok
  end

  test "student cannot show other lesson" do
    sign_in users(:student_pedro)
    get lesson_path(lessons(:ivan_ana_lesson))
    assert_response :forbidden
  end

  test "teacher can cancel lesson" do
    sign_in users(:teacher_ivan)
    lesson = lessons(:ivan_ana_lesson)
    delete lesson_path(lesson)
    assert_redirected_to lessons_path
    assert_equal "cancelled", lesson.reload.status
  end

  test "unauthenticated user cannot access lessons" do
    get lessons_path
    assert_redirected_to new_session_path
  end
end
