# frozen_string_literal: true

class TeachersController < InertiaController
  before_action :set_teacher, only: [ :update, :assign_student, :remove_student ]

  def index
    authorize :teacher, :index?

    teachers = User.teachers
      .includes(:teacher_profile, teacher_student_links: :student)

    # Load lesson counts for this week in one query
    week_range = Time.current.beginning_of_week..Time.current.end_of_week
    teacher_ids = teachers.pluck(:id)
    lessons_this_week = Lesson.where(teacher_id: teacher_ids, scheduled_at: week_range)
      .group(:teacher_id).count

    # Load available students (not already assigned to any teacher)
    assigned_student_ids = TeacherStudent.distinct.pluck(:student_id)
    available_students = User.students
      .where.not(id: assigned_student_ids)
      .kept

    render inertia: "teachers/Index", props: {
      teachers: teachers.map { |t| teacher_json(t, lessons_this_week[t.id] || 0) },
      availableStudents: available_students.map { |s| { id: s.id, name: s.name } }
    }
  end

  def update
    authorize :teacher, :update?

    if @teacher.teacher_profile.update(teacher_params)
      redirect_to teachers_path, notice: t("flash.teacher_updated")
    else
      redirect_to teachers_path, inertia: { errors: @teacher.teacher_profile.errors }
    end
  end

  def assign_student
    authorize :teacher, :assign_student?

    ts = TeacherStudent.create!(
      teacher_id: @teacher.id,
      student_id: params[:student_id],
      assigned_by: current_user.id
    )

    conv = Conversation.create!(teacher_student_id: ts.id)
    conv.conversation_participants.create!(user: @teacher)
    conv.conversation_participants.create!(user_id: params[:student_id])

    # Both parties get a direct heads-up with the other's name; otherwise the
    # pairing is silent until one of them stumbles into the calendar or chat.
    NotificationJob.perform_later(
      user_id: @teacher.id,
      title_key: "notifications.new_student_assigned",
      title_params: { name: ts.student.name },
      notifiable: ts
    )
    NotificationJob.perform_later(
      user_id: ts.student_id,
      title_key: "notifications.new_teacher_assigned",
      title_params: { name: @teacher.name },
      notifiable: ts
    )

    redirect_to teachers_path, notice: t("flash.student_assigned")
  end

  def remove_student
    authorize :teacher, :remove_student?

    TeacherStudent.find_by!(teacher_id: @teacher.id, student_id: params[:student_id]).destroy!

    redirect_to teachers_path, notice: t("flash.student_removed")
  end

  private

  def set_teacher
    @teacher = User.find(params[:id])
  end

  def teacher_params
    params.permit(:level, :hourly_rate, :bio, :permanent_meeting_link)
  end

  def teacher_json(t, lessons_count)
    profile = t.teacher_profile
    students = t.teacher_student_links.map { |ts| { id: ts.student_id, name: ts.student&.name } }

    {
      id: t.id,
      name: t.name,
      avatarUrl: t.avatar_url,
      level: profile&.level,
      hourlyRate: profile&.hourly_rate&.to_f,
      bio: profile&.bio,
      permanentMeetingLink: profile&.permanent_meeting_link,
      studentsCount: students.size,
      lessonsThisWeek: lessons_count,
      students: students
    }
  end
end
