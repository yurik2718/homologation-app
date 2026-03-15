module Auth
  class OmniauthCallbacksController < ApplicationController
    allow_unauthenticated_access
    skip_before_action :verify_authenticity_token, only: :create

    def create
      auth = request.env["omniauth.auth"]
      user = User.find_or_create_from_oauth(auth)
      start_new_session_for(user)
      redirect_to root_path, notice: t("flash.signed_in")
    end

    def failure
      redirect_to new_session_path, alert: t("flash.auth_failed")
    end
  end
end
