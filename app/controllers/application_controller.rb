# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # verify_authorized lives in InertiaController (not here),
  # so auth controllers (Sessions, Passwords) are not forced to call authorize.

  rescue_from Pundit::NotAuthorizedError, with: :pundit_not_authorized

  around_action :switch_locale
  before_action :require_complete_profile

  inertia_share do
    {
      auth: { user: Current.user ? user_json(Current.user) : nil },
      flash: { notice: flash[:notice], alert: flash[:alert] },
      features: Current.user ? build_features(Current.user) : {},
      unreadNotificationsCount: Current.user ? Current.user.notifications.unread.count : 0,
      selectOptions: Rails.application.config.select_options
    }
  end

  private

  def pundit_user = Current.user
  def current_user = Current.user

  def pundit_not_authorized
    head :forbidden
  end

  def user_json(u)
    {
      id: u.id,
      name: u.name,
      email: u.email_address,
      roles: u.roles.pluck(:name),
      avatarUrl: u.avatar_url,
      locale: u.locale,
      profileComplete: u.profile_complete?
    }
  end

  def build_features(user)
    {
      # Action permissions
      canConfirmPayment: user.coordinator? || user.super_admin?,
      canManageUsers: user.super_admin?,
      canManageTeachers: user.coordinator? || user.super_admin?,
      canAccessInbox: user.coordinator? || user.super_admin?,
      canAccessAdmin: user.super_admin?,
      canCreateRequest: user.student?,
      canCreateLesson: user.teacher? || user.coordinator? || user.super_admin?,
      # Navigation visibility — intentionally separate from action permissions,
      # logic may overlap today but can diverge as roles evolve
      canSeeDashboard: user.super_admin? || user.coordinator? || user.student?,
      canSeeAllRequests: user.coordinator? || user.super_admin?,
      canSeeMyRequests: user.student?,
      canSeeAllLessons: user.coordinator? || user.super_admin?,
      canSeeCalendar: user.teacher?,
      canSeeMyLessons: user.student?,
      canSeeChat: user.teacher? || user.student?
    }
  end

  def require_complete_profile
    return unless Current.user
    return if Current.user.profile_complete?
    return if request.path.start_with?("/profile", "/session", "/registration", "/auth", "/passwords")
    redirect_to edit_profile_path, notice: t("flash.complete_profile")
  end

  def switch_locale(&action)
    locale = extract_locale_from_user || extract_locale_from_header || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  def extract_locale_from_user
    Current.user&.locale
  end

  def extract_locale_from_header
    accept = request.env["HTTP_ACCEPT_LANGUAGE"]
    return nil unless accept

    preferred = accept.scan(/[a-z]{2}/).first
    I18n.available_locales.map(&:to_s).include?(preferred) ? preferred : nil
  end
end
