# Authentication & OAuth

## Overview

Authentication uses the **Rails 8 built-in authentication generator** (`bin/rails generate authentication`) combined with **OmniAuth** for Google and Apple sign-in.

**NOT using Devise** — keeping it simple with the built-in generator.

## Rails 8 Authentication Generator

```bash
bin/rails generate authentication
```

This generates:
- `User` model with `has_secure_password`
- `Session` model for session tracking
- `SessionsController` (create/destroy)
- `PasswordsController` (reset flow)
- `Authentication` concern (included in ApplicationController)
- Migration for `users` (email_address, password_digest) and `sessions`

**We will extend** the generated User model with additional fields (name, provider, uid, phone, etc.).

## OAuth Setup

### Gems
```ruby
# Gemfile
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-apple"
gem "omniauth-rails_csrf_protection"  # CSRF protection for OmniAuth
```

### Configuration

```ruby
# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    Rails.application.credentials.dig(:google, :client_id),
    Rails.application.credentials.dig(:google, :client_secret),
    {
      scope: "email,profile",
      prompt: "select_account"
    }

  provider :apple,
    Rails.application.credentials.dig(:apple, :client_id),
    "",
    {
      scope: "email name",
      team_id: Rails.application.credentials.dig(:apple, :team_id),
      key_id: Rails.application.credentials.dig(:apple, :key_id),
      pem: Rails.application.credentials.dig(:apple, :pem)
    }
end

OmniAuth.config.allowed_request_methods = [:post]
```

### Credentials Structure
```bash
bin/rails credentials:edit
```

```yaml
google:
  client_id: "xxx.apps.googleusercontent.com"
  client_secret: "xxx"

apple:
  client_id: "com.yourapp.service"
  team_id: "XXXXXXXXXX"
  key_id: "XXXXXXXXXX"
  pem: |
    -----BEGIN PRIVATE KEY-----
    ...
    -----END PRIVATE KEY-----

amo_crm:
  base_url: "https://yourdomain.amocrm.com"
  client_id: "xxx"
  client_secret: "xxx"
  redirect_uri: "https://yourapp.com/amo_crm/callback"
```

### OAuth Callback Controller
```ruby
# app/controllers/auth/omniauth_callbacks_controller.rb
module Auth
  class OmniauthCallbacksController < ApplicationController
    skip_before_action :verify_authenticity_token, only: :create

    def create
      auth = request.env["omniauth.auth"]
      user = User.find_or_create_from_oauth(auth)

      start_new_session_for(user)
      redirect_to root_path, notice: "Signed in successfully!"
    end

    def failure
      redirect_to new_session_path, alert: "Authentication failed."
    end
  end
end
```

### User Model OAuth Method
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password validations: false  # Allow OAuth-only users (no password)

  def self.find_or_create_from_oauth(auth)
    user = find_by(provider: auth.provider, uid: auth.uid)
    user ||= find_by(email_address: auth.info.email)

    if user
      user.update!(provider: auth.provider, uid: auth.uid) unless user.uid
    else
      user = create!(
        email_address: auth.info.email,
        name: auth.info.name,
        provider: auth.provider,
        uid: auth.uid,
        avatar_url: auth.info.image
      )
      user.roles << Role.find_by!(name: "student")  # Default role
    end

    user
  end
end
```

### Routes
```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Built-in auth routes
  resource :session, only: [:new, :create, :destroy]
  resource :registration, only: [:new, :create]
  resources :passwords, param: :token, only: [:new, :create, :edit, :update]

  # OAuth routes
  get  "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  post "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/failure",            to: "auth/omniauth_callbacks#failure"
end
```

### Frontend Login Page
```tsx
// app/frontend/pages/auth/Login.tsx
export default function Login() {
  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Email/password form via Inertia */}
          <form method="post" action="/session">
            <Input name="email_address" type="email" placeholder="Email" />
            <Input name="password" type="password" placeholder="Password" />
            <Button type="submit">Sign In</Button>
          </form>

          <Separator />

          {/* OAuth buttons - regular POST links */}
          <form method="post" action="/auth/google_oauth2">
            <input type="hidden" name="authenticity_token" value={csrfToken} />
            <Button variant="outline" type="submit">
              <GoogleIcon /> Continue with Google
            </Button>
          </form>

          <form method="post" action="/auth/apple">
            <input type="hidden" name="authenticity_token" value={csrfToken} />
            <Button variant="outline" type="submit">
              <AppleIcon /> Continue with Apple
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
```
