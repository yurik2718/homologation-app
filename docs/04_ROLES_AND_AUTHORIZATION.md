# Roles & Authorization (Pundit)

## 4 Roles

| Role | Description |
|---|---|
| `super_admin` | Full access. User management, Stripe billing, AmoCRM, teacher management |
| `coordinator` | Manages homologation requests. Assigns teachers to students. Chats with students |
| `teacher` | Sees assigned students. Calendar of lessons. Shares meeting links. Chats with students |
| `student` | Submits requests, uploads documents, chats, books lessons |

**Family role removed** — duplicates student functionality.

## Permission Matrix

| Action                              | super_admin | coordinator | teacher | student |
|-------------------------------------|:-----------:|:-----------:|:-------:|:-------:|
| **🔧 Administration**              |             |             |         |         |
| Admin dashboard                     |     ✅      |      —      |    —    |    —    |
| Manage users (CRUD)                 |     ✅      |      —      |    —    |    —    |
| Stripe billing                      |     ✅      |      —      |    —    |    —    |
| Set teacher level / rate            |     ✅      |      —      |    —    |    —    |
| **📋 Homologation & Documents**    |             |             |         |         |
| View all requests                   |     ✅      |     ✅      |    —    |    —    |
| View own requests                   |     ✅      |     ✅      |    —    |   ✅    |
| Submit new request                  |      —      |      —      |    —    |   ✅    |
| Change request status               |     ✅      |     ✅      |    —    |    —    |
| Confirm payment                     |     ✅      |     ✅      |    —    |    —    |
| Upload documents                    |     ✅      |     ✅      |    —    |   ✅    |
| Download documents                  |     ✅      |     ✅      |    —    |    —    |
| **👩‍🏫 Teachers & Lessons**          |             |             |         |         |
| Assign teacher to student           |     ✅      |     ✅      |    —    |    —    |
| View teacher calendar               |     ✅      |     ✅      |   ✅    |    —    |
| View own lessons                    |      —      |      —      |   ✅    |   ✅    |
| Create / edit lessons               |     ✅      |     ✅      |   ✅    |    —    |
| Share meeting link in chat          |      —      |      —      |   ✅    |    —    |
| **💬 Chat**                         |             |             |         |         |
| Chat in request conversation        |     ✅      |     ✅      |    —    |   ✅    |
| Chat teacher ↔ student             |     ✅      |     ✅      |   ✅    |   ✅    |
| Read all chats (oversight)          |     ✅      |     ✅      |    —    |    —    |

## Implementation

### User Model

```ruby
class User < ApplicationRecord
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_one :teacher_profile, dependent: :destroy

  # Teacher-Student many-to-many
  has_many :teacher_student_links, class_name: "TeacherStudent", foreign_key: :teacher_id
  has_many :students, through: :teacher_student_links, source: :student
  has_many :student_teacher_links, class_name: "TeacherStudent", foreign_key: :student_id
  has_many :teachers, through: :student_teacher_links, source: :teacher

  # Lessons
  has_many :taught_lessons, class_name: "Lesson", foreign_key: :teacher_id
  has_many :booked_lessons, class_name: "Lesson", foreign_key: :student_id

  def super_admin? = has_role?("super_admin")
  def coordinator? = has_role?("coordinator")
  def teacher?     = has_role?("teacher")
  def student?     = has_role?("student")

  private

  def has_role?(name) = roles.exists?(name: name)
end
```

### Inertia Shared Data

```ruby
current_user: {
  id: u.id,
  name: u.name,
  email: u.email_address,
  roles: u.roles.pluck(:name),
  avatar_url: u.avatar_url
}
```

### Frontend RoleGuard

```tsx
function RoleGuard({ roles, children }) {
  const { current_user } = usePage().props
  if (!current_user?.roles?.some(r => roles.includes(r))) return null
  return <>{children}</>
}
```
