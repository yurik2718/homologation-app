require "test_helper"

class LessonsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @teacher = create(:user, :teacher)
    @student = create(:user, :student)
    @other_student = create(:user, :student)
    @coordinator = create(:user, :coordinator)
    @admin = create(:user, :super_admin)
    @teacher_profile = create(:teacher_profile, user: @teacher)
    @assignment = create(:teacher_student, teacher: @teacher, student: @student, assigned_by: @coordinator.id)
    @lesson = create(:lesson, teacher: @teacher, student: @student)
  end

  test "teacher sees own calendar" do
    sign_in @teacher
    get lessons_path
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "student sees own lessons" do
    sign_in @student
    get lessons_path
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "coordinator redirects to admin lessons" do
    sign_in @coordinator
    get lessons_path
    assert_redirected_to admin_lessons_path
  end

  test "super_admin redirects to admin lessons" do
    sign_in @admin
    get lessons_path
    assert_redirected_to admin_lessons_path
  end

  test "teacher can create lesson for assigned student" do
    sign_in @teacher
    assert_difference "Lesson.count", 1 do
      post lessons_path, params: {
        lesson: { student_id: @student.id, scheduled_at: 1.week.from_now,
                  duration_minutes: 60 }
      }
    end
    assert_redirected_to lesson_path(Lesson.last)
  end

  test "teacher-created lesson notifies student only (teacher is the actor)" do
    sign_in @teacher
    assert_enqueued_jobs 1, only: NotificationJob do
      post lessons_path, params: {
        lesson: { student_id: @student.id, scheduled_at: 1.week.from_now,
                  duration_minutes: 60 }
      }
    end
  end

  test "admin-created lesson notifies both student and teacher" do
    sign_in @admin
    assert_enqueued_jobs 2, only: NotificationJob do
      post lessons_path, params: {
        lesson: { teacher_id: @teacher.id, student_id: @student.id,
                  scheduled_at: 1.week.from_now, duration_minutes: 60 }
      }
    end
  end

  test "teacher cannot create lesson for non-assigned student" do
    sign_in @teacher
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { student_id: @other_student.id, scheduled_at: 1.week.from_now,
                  duration_minutes: 60 }
      }
    end
  end

  test "cannot create lesson in the past" do
    sign_in @teacher
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { student_id: @student.id, scheduled_at: 1.day.ago,
                  duration_minutes: 60 }
      }
    end
  end

  test "teacher can mark lesson completed" do
    sign_in @teacher
    patch lesson_path(@lesson), params: { lesson: { status: "completed", notes: "Good progress" } }
    assert_redirected_to lesson_path(@lesson)
    assert_equal "completed", @lesson.reload.status
    assert_equal "Good progress", @lesson.reload.notes
  end

  test "student cannot create lessons" do
    sign_in @student
    assert_no_difference "Lesson.count" do
      post lessons_path, params: {
        lesson: { teacher_id: @teacher.id, student_id: @student.id,
                  scheduled_at: 1.week.from_now, duration_minutes: 60 }
      }
    end
    assert_response :forbidden
  end

  test "teacher can show lesson" do
    sign_in @teacher
    get lesson_path(@lesson)
    assert_response :ok
  end

  test "student can show own lesson" do
    sign_in @student
    get lesson_path(@lesson)
    assert_response :ok
  end

  test "student cannot show other lesson" do
    sign_in @other_student
    get lesson_path(@lesson)
    assert_response :forbidden
  end

  test "teacher can cancel lesson" do
    sign_in @teacher
    delete lesson_path(@lesson)
    assert_redirected_to lessons_path
    assert_equal "cancelled", @lesson.reload.status
  end

  # --- Invalid date params fallback ---

  test "invalid week_start param falls back to current week" do
    sign_in @teacher
    get lessons_path, params: { view: "week", week_start: "not-a-date" }
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "invalid month param falls back to current month" do
    sign_in @teacher
    get lessons_path, params: { view: "month", month: "invalid" }
    assert_response :ok
    assert_equal "calendar/Index", inertia.component
  end

  test "empty date params use current dates" do
    sign_in @teacher
    get lessons_path, params: { view: "week", week_start: "" }
    assert_response :ok
    props = inertia.props
    assert props[:weekStart].present?
  end

  test "unauthenticated user cannot access lessons" do
    get lessons_path
    assert_redirected_to new_session_path
  end
end
