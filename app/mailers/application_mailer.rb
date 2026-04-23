class ApplicationMailer < ActionMailer::Base
  default from: -> { ENV.fetch("MAIL_FROM", "Space for Edu <noreply@spaceforedu.com>") }
  layout "mailer"
end
