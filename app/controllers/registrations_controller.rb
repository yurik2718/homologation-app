class RegistrationsController < ApplicationController
  allow_unauthenticated_access
  rate_limit to: 5, within: 1.hour, only: :create,
             with: -> { redirect_to new_registration_path, alert: t("flash.rate_limit_exceeded") }

  def new
    render inertia: "auth/Register"
  end

  def create
    unless ActiveModel::Type::Boolean.new.cast(params[:privacy_accepted])
      return redirect_to new_registration_path,
        inertia: { errors: { privacy_accepted: [ t("errors.messages.accepted") ] } }
    end

    user = User.new(registration_params.merge(
      has_homologation: true,
      privacy_accepted_at: Time.current
    ))
    if user.save
      user.assign_student_role!
      start_new_session_for(user)
      redirect_to dashboard_path, notice: t("flash.registered")
    else
      redirect_to new_registration_path, inertia: { errors: user.errors.to_hash(true) }
    end
  end

  private

  def registration_params
    params.permit(:name, :email_address, :password, :password_confirmation)
  end
end
