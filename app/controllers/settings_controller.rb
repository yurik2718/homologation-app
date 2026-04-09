class SettingsController < InertiaController
  include UserSerializer
  include TelegramConnectable

  before_action :set_user
  skip_before_action :require_complete_profile

  def profile
    authorize @user, :edit?, policy_class: ProfilePolicy
    render inertia: "settings/Profile", props: { profile: profile_json(@user) }
  end

  def update_profile
    authorize @user, :update?, policy_class: ProfilePolicy
    if @user.update(profile_params)
      redirect_to settings_profile_path, notice: t("flash.profile_updated")
    else
      redirect_to settings_profile_path, inertia: { errors: @user.errors }
    end
  end

  def account
    authorize @user, :edit?, policy_class: ProfilePolicy
    render inertia: "settings/Account", props: { account: account_json(@user) }
  end

  def update_account
    authorize @user, :update?, policy_class: ProfilePolicy
    unless @user.authenticate(params[:current_password].to_s)
      return redirect_to settings_account_path,
        inertia: { errors: { current_password: t("settings.invalid_current_password") } }
    end
    if params[:password].blank?
      return redirect_to settings_account_path,
        inertia: { errors: { password: t("activerecord.errors.messages.blank") } }
    end
    unless params[:password] == params[:password_confirmation]
      return redirect_to settings_account_path,
        inertia: { errors: { password_confirmation: t("flash.password_mismatch") } }
    end
    if @user.update(password: params[:password])
      redirect_to settings_account_path, notice: t("flash.password_updated")
    else
      redirect_to settings_account_path, inertia: { errors: @user.errors }
    end
  end

  def notifications
    authorize @user, :edit?, policy_class: ProfilePolicy
    render inertia: "settings/Notifications", props: { notifications: notifications_json(@user) }
  end

  def update_notifications
    authorize @user, :update?, policy_class: ProfilePolicy
    if @user.update(notifications_params)
      redirect_to settings_notifications_path, notice: t("flash.settings_saved")
    else
      redirect_to settings_notifications_path, inertia: { errors: @user.errors }
    end
  end

  def data_export
    authorize @user, :show?, policy_class: ProfilePolicy
    data = {
      exported_at: Time.current.iso8601,
      user: {
        name: @user.name,
        email: @user.email_address,
        phone: @user.phone,
        whatsapp: @user.whatsapp,
        birthday: @user.birthday&.iso8601,
        country: @user.country,
        locale: @user.locale,
        created_at: @user.created_at.iso8601,
        privacy_accepted_at: @user.privacy_accepted_at&.iso8601
      },
      homologation_requests: @user.homologation_requests.map { |r|
        { id: r.id, subject: r.subject, status: r.status,
          service_type: r.service_type, created_at: r.created_at.iso8601 }
      },
      lessons: @user.booked_lessons.map { |l|
        { id: l.id, scheduled_at: l.scheduled_at&.iso8601, status: l.status }
      }
    }
    send_data data.to_json,
      filename: "my-data-#{Date.current}.json",
      type: "application/json",
      disposition: "attachment"
  end

  def request_deletion
    authorize @user, :update?, policy_class: ProfilePolicy
    return redirect_to settings_account_path if @user.deletion_requested_at.present?

    @user.update!(deletion_requested_at: Time.current)

    super_admins = User.super_admins.kept
    super_admins.each do |admin|
      NotificationJob.perform_later(
        user_id: admin.id,
        title: t("notifications.deletion_requested", name: @user.name),
        body: @user.email_address,
        notifiable: nil
      )
    end

    redirect_to settings_account_path, notice: t("flash.deletion_requested")
  end

  private

  def set_user = @user = Current.user

  def telegram_disconnect_redirect_path = settings_notifications_path

  def profile_params
    params.permit(:name, :phone, :whatsapp, :birthday, :country, :locale,
                  :is_minor, :guardian_name, :guardian_email, :guardian_phone, :guardian_whatsapp)
  end

  def notifications_params
    params.permit(:notification_email, :notification_telegram)
  end

  def account_json(u)
    { id: u.id, name: u.name, email: u.email_address,
      provider: u.provider, hasPassword: u.password_digest.present?,
      deletionRequestedAt: u.deletion_requested_at&.iso8601 }
  end
end
