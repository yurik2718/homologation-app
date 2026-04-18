FactoryBot.define do
  factory :lesson do
    association :teacher, factory: [ :user, :teacher ]
    association :student, factory: [ :user, :student ]
    scheduled_at { 1.day.from_now.change(hour: 10) }
    duration_minutes { 60 }
    status { "scheduled" }

    after(:build) do |lesson|
      unless TeacherStudent.exists?(teacher: lesson.teacher, student: lesson.student)
        coordinator = User.joins(:roles).where(roles: { name: "coordinator" }).first ||
                      FactoryBot.create(:user, :coordinator)
        TeacherStudent.create!(
          teacher: lesson.teacher,
          student: lesson.student,
          assigned_by: coordinator.id
        )
      end
    end

    trait :cancelled do
      status { "cancelled" }
    end

    trait :completed do
      status { "completed" }
    end
  end
end
