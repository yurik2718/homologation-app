# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # NOTE: after_action :verify_authorized is added after authentication is set up (Step 1+)
  # NOTE: include Authentication is generated and added in Step 1

  around_action :switch_locale

  inertia_share do
    {
      auth: { user: respond_to?(:current_user, true) && current_user ? user_json(current_user) : nil },
      flash: { notice: flash[:notice], alert: flash[:alert] },
      features: respond_to?(:current_user, true) && current_user ? build_features(current_user) : {},
      unreadNotificationsCount: 0, # TODO Step 8: replace with current_user.notifications.where(read_at: nil).count
      selectOptions: Rails.application.config.select_options
    }
  end

  private

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

  def switch_locale(&action)
    locale = extract_locale_from_user || extract_locale_from_header || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  def extract_locale_from_user
    return nil unless respond_to?(:current_user, true)

    current_user&.locale
  end

  def extract_locale_from_header
    accept = request.env["HTTP_ACCEPT_LANGUAGE"]
    return nil unless accept

    preferred = accept.scan(/[a-z]{2}/).first
    I18n.available_locales.map(&:to_s).include?(preferred) ? preferred : nil
  end
end
