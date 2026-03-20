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

        # Collect unique user IDs via pluck (single SQL, no full load)
        user_ids = (lessons.pluck(:teacher_id) + lessons.pluck(:student_id)).uniq
        users_for_profiles = User.where(id: user_ids).includes(:roles, :teacher_profile)

        # Find most recent conversation per user (one query)
        user_conversations = ConversationParticipant
          .where(user_id: user_ids)
          .joins(:conversation)
          .select("conversation_participants.user_id, conversations.id AS conversation_id")
          .order(Arel.sql("conversations.last_message_at DESC NULLS LAST"))
          .group_by(&:user_id)
          .transform_values { |cps| cps.first.conversation_id }

        user_profiles = users_for_profiles.index_by(&:id).transform_values { |u| user_profile_json(u, user_conversations[u.id]) }

        render inertia: "admin/Lessons", props: {
          view: "list",
          lessons: lessons.map { |l| lesson_json(l) },
          teachers: teachers,
          students: students,
          userProfiles: user_profiles
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

    def user_profile_json(u, conversation_id = nil)
      profile = {
        id: u.id,
        name: u.name,
        email: u.email_address,
        avatarUrl: u.avatar_url,
        roles: u.roles.map(&:name),
        phone: u.phone,
        whatsapp: u.whatsapp,
        country: u.country,
        locale: u.locale,
        createdAt: u.created_at.iso8601,
        conversationId: conversation_id
      }
      if u.teacher_profile.present?
        profile[:teacherLevel] = u.teacher_profile.level
        profile[:hourlyRate] = u.teacher_profile.hourly_rate&.to_f
        profile[:permanentMeetingLink] = u.teacher_profile.permanent_meeting_link
      end
      profile
    end

    # month_lesson_json is inherited from LessonSerializer
  end
end
