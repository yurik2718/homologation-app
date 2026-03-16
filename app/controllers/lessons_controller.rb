class LessonsController < InertiaController
  include LessonSerializer

  before_action :set_lesson, only: [ :show, :update, :destroy ]

  def index
    authorize Lesson
    if current_user.teacher?
      week_start = params[:week_start] ? Date.parse(params[:week_start]) : Date.current.beginning_of_week
      week_lessons = policy_scope(Lesson).includes(:student, teacher: :teacher_profile)
                                         .where(scheduled_at: week_start..(week_start + 6.days).end_of_day)
                                         .order(:scheduled_at)
      assigned_students = current_user.teacher_student_links.includes(:student).map do |ts|
        { id: ts.student_id, name: ts.student.name }
      end
      render inertia: "calendar/Index", props: {
        lessons: week_lessons.map { |l| lesson_json(l) },
        weekStart: week_start.iso8601,
        assignedStudents: assigned_students
      }
    elsif current_user.student?
      lessons = policy_scope(Lesson).includes(teacher: :teacher_profile).order(:scheduled_at)
      render inertia: "lessons/Index", props: {
        upcoming: lessons.where("scheduled_at >= ?", Time.current).map { |l| lesson_json(l) },
        past: lessons.where("scheduled_at < ?", Time.current).order(scheduled_at: :desc).map { |l| lesson_json(l) }
      }
    else
      redirect_to admin_lessons_path
    end
  end

  def show
    authorize @lesson
    render inertia: "lessons/Show", props: { lesson: lesson_json(@lesson) }
  end

  def create
    @lesson = Lesson.new(lesson_params)
    @lesson.teacher_id = current_user.id if current_user.teacher?
    authorize @lesson

    if @lesson.save
      NotificationJob.perform_later(
        user_id: @lesson.student_id,
        title: I18n.t("notifications.lesson_scheduled", date: @lesson.scheduled_at.strftime("%d/%m/%Y %H:%M")),
        notifiable: @lesson
      )
      redirect_to lesson_path(@lesson), notice: t("flash.lesson_created")
    else
      redirect_to lessons_path, inertia: { errors: @lesson.errors }
    end
  end

  def update
    authorize @lesson
    if @lesson.update(update_lesson_params)
      redirect_to lesson_path(@lesson), notice: t("flash.lesson_updated")
    else
      redirect_to lesson_path(@lesson), inertia: { errors: @lesson.errors }
    end
  end

  def destroy
    authorize @lesson
    @lesson.update!(status: "cancelled")
    [ @lesson.student_id, @lesson.teacher_id ].each do |user_id|
      NotificationJob.perform_later(
        user_id: user_id,
        title: I18n.t("notifications.lesson_cancelled", date: @lesson.scheduled_at.strftime("%d/%m/%Y %H:%M")),
        notifiable: @lesson
      )
    end
    redirect_to lessons_path, notice: t("flash.lesson_cancelled")
  end

  private

  def set_lesson
    @lesson = Lesson.includes(:teacher, :student).find(params[:id])
  end

  def lesson_params
    params.require(:lesson).permit(:student_id, :teacher_id, :scheduled_at, :duration_minutes, :meeting_link)
  end

  def update_lesson_params
    params.require(:lesson).permit(:status, :notes, :meeting_link, :duration_minutes)
  end
end
