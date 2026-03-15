class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[new create]
  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { redirect_to new_session_path, alert: t("flash.rate_limit_exceeded") }

  def new
    render inertia: "auth/Login"
  end

  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for(user)
      redirect_to after_authentication_url
    else
      redirect_to new_session_path, alert: t("flash.invalid_credentials")
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path, notice: t("flash.signed_out"), status: :see_other
  end
end
