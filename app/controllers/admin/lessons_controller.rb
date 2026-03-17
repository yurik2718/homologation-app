module Admin
  class LessonsController < InertiaController
    include LessonSerializer

    def index
      authorize :admin_lesson, :index?

      teachers = User.joins(:roles).where(roles: { name: "teacher" }).order(:name).map { |u| { id: u.id, name: u.name } }
      students = User.joins(:roles).where(roles: { name: "student" }).order(:name).map { |u| { id: u.id, name: u.name } }

      view = params[:view].presence || "week"

      case view
      when "week"
        week_start = parse_date(params[:week_start])&.beginning_of_week(:monday) || Date.current.beginning_of_week(:monday)
        week_end = week_start + 6.days

        lessons = base_scope
                    .where(scheduled_at: week_start.beginning_of_day..week_end.end_of_day)
                    .order(:scheduled_at)
        lessons = lessons.where(teacher_id: params[:teacher_id]) if params[:teacher_id].present?

        render inertia: "admin/Lessons", props: {
          view: "week",
          lessons: lessons.map { |l| lesson_json(l) },
          teachers: teachers,
          students: students,
          weekStart: week_start.iso8601
        }

      when "month"
        month_date = parse_month(params[:month]) || Date.current.beginning_of_month
        month_start = month_date.beginning_of_month
        month_end = month_date.end_of_month

        lessons = base_scope
                    .where(scheduled_at: month_start.beginning_of_day..month_end.end_of_day)
                    .where.not(status: "cancelled")
                    .order(:scheduled_at)

        month_summary = lessons.group_by { |l| l.scheduled_at.to_date.iso8601 }.transform_values do |day_lessons|
          day_lessons.map { |l| month_lesson_json(l) }
        end

        render inertia: "admin/Lessons", props: {
          view: "month",
          lessons: [],
          teachers: teachers,
          students: students,
          monthStart: month_start.iso8601,
          monthSummary: month_summary
        }

      else # list
        lessons = base_scope.order(scheduled_at: :desc)
        lessons = lessons.where(teacher_id: params[:teacher_id]) if params[:teacher_id].present?
        lessons = lessons.where(student_id: params[:student_id]) if params[:student_id].present?
        lessons = lessons.where(status: params[:status]) if params[:status].present?

        render inertia: "admin/Lessons", props: {
          view: "list",
          lessons: lessons.map { |l| lesson_json(l) },
          teachers: teachers,
          students: students
        }
      end
    end

    private

    def base_scope
      policy_scope(Lesson).includes(:teacher, :student)
    end

    def parse_date(value)
      Date.parse(value) if value.present?
    rescue Date::Error
      nil
    end

    def parse_month(value)
      Date.parse("#{value}-01") if value.present?
    rescue Date::Error
      nil
    end

    def month_lesson_json(l)
      {
        id: l.id,
        teacherId: l.teacher_id,
        teacherName: l.teacher.name,
        studentName: l.student.name,
        scheduledAt: l.scheduled_at.iso8601,
        durationMinutes: l.duration_minutes,
        status: l.status,
        meetingLinkReady: l.meeting_link_ready?
      }
    end
  end
end
