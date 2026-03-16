class ProfilesController < InertiaController
  before_action :set_user
  skip_before_action :require_complete_profile

  def edit
    authorize @user, :edit?, policy_class: ProfilePolicy
    render inertia: "profile/Edit", props: { profile: profile_json(@user) }
  end

  def update
    authorize @user, :update?, policy_class: ProfilePolicy
    if @user.update(profile_params)
      redirect_to root_path, notice: t("flash.profile_updated")
    else
      redirect_to edit_profile_path, inertia: { errors: @user.errors }
    end
  end

  def connect_telegram
    authorize @user, :update?, policy_class: ProfilePolicy
    token = SecureRandom.hex(16)
    @user.update!(telegram_link_token: token)
    bot_name = Rails.application.credentials.dig(:telegram, :bot_name) || "HomologationBot"
    redirect_to "https://t.me/#{bot_name}?start=#{token}", allow_other_host: true
  end

  def disconnect_telegram
    authorize @user, :update?, policy_class: ProfilePolicy
    @user.update!(telegram_chat_id: nil, notification_telegram: false)
    redirect_to edit_profile_path, notice: t("flash.telegram_disconnected")
  end

  private

  def set_user = @user = Current.user

  def profile_params
    params.permit(:name, :phone, :whatsapp, :birthday, :country, :locale,
                  :is_minor, :guardian_name, :guardian_email, :guardian_phone, :guardian_whatsapp,
                  :notification_email, :notification_telegram)
  end

  def profile_json(u)
    { id: u.id, name: u.name, email: u.email_address, phone: u.phone, whatsapp: u.whatsapp,
      birthday: u.birthday&.iso8601, country: u.country, locale: u.locale,
      isMinor: u.is_minor, guardianName: u.guardian_name, guardianEmail: u.guardian_email,
      guardianPhone: u.guardian_phone, guardianWhatsapp: u.guardian_whatsapp,
      profileComplete: u.profile_complete?,
      notificationEmail: u.notification_email?,
      notificationTelegram: u.notification_telegram?,
      telegramConnected: u.telegram_chat_id.present? }
  end
end
