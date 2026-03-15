# Testing Patterns (Minitest)

## What to Test Where

| Layer | Test for | Don't test |
|---|---|---|
| **Models** | Validations, `transition_to!` guards, scopes, associations | Controller logic, rendering |
| **Controllers** | HTTP status, Inertia component name, authorization (Pundit), redirects | Business logic (push to model) |
| **Jobs** | Side effects (AmoCRM sync), error handling | HTTP internals (mock with WebMock) |
| **System** | Critical user journeys: login, submit request, chat | Every edge case |

## Rules

- **Fixtures only** — no FactoryBot, no mocks for ActiveRecord. Fixtures in `test/fixtures/*.yml`.
- **Every new controller action gets a test before merge.** No exceptions.
- Run `bin/rails test && npm run check` before committing.

## Controller Test Example

```ruby
class HomologationRequestsControllerTest < ActionDispatch::IntegrationTest
  test "student sees own requests" do
    sign_in users(:student_ana)
    get homologation_requests_path
    assert_response :ok
    assert_inertia component: "Requests/Index"
  end

  test "coordinator can confirm payment" do
    sign_in users(:coordinator_maria)
    request = homologation_requests(:ana_equivalencia)
    request.update!(status: "awaiting_payment")
    post confirm_payment_homologation_request_path(request), params: { payment_amount: 60 }
    assert_redirected_to homologation_request_path(request)
    assert_equal "payment_confirmed", request.reload.status
  end
end
```
