FactoryBot.define do
  factory :teacher_student do
    association :teacher, factory: [ :user, :teacher ]
    association :student, factory: [ :user, :student ]

    transient do
      assigned_by_user { nil }
    end

    after(:build) do |ts, evaluator|
      if evaluator.assigned_by_user
        ts.assigned_by = evaluator.assigned_by_user.id
      elsif ts.assigned_by.blank?
        coordinator = User.joins(:roles).where(roles: { name: "coordinator" }).first ||
                      FactoryBot.create(:user, :coordinator)
        ts.assigned_by = coordinator.id
      end
    end
  end
end
