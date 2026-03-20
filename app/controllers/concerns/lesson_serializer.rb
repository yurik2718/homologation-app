module LessonSerializer
  def lesson_json(l)
    {
      id: l.id,
      teacherId: l.teacher_id,
      studentId: l.student_id,
      teacherName: l.teacher.name,
      studentName: l.student.name,
      scheduledAt: l.scheduled_at.iso8601,
      durationMinutes: l.duration_minutes,
      meetingLink: l.meeting_link,
      effectiveMeetingLink: l.effective_meeting_link,
      meetingLinkReady: l.meeting_link_ready?,
      status: l.status,
      notes: l.notes
    }
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
