class PasswordsMailer < ApplicationMailer
  def reset(user)
    @user = user

    I18n.with_locale(@user.locale) do
      mail(
        to: @user.email_address,
        subject: I18n.t("mailers.passwords_mailer.subject")
      )
    end
  end
end
