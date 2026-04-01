module Admin
  class UsersController < InertiaController
    before_action :set_user, only: [ :edit, :update, :destroy, :assign_role, :remove_role, :gdpr_delete ]

    def index
      authorize User
      render inertia: "admin/Users", props: {
        users: users_list
      }
    end

    def new
      authorize User
      render inertia: "admin/Users", props: {
        users: users_list,
        newUser: true
      }
    end

    def create
      authorize User
      @user = User.new({ has_homologation: true }.merge(user_params))
      if @user.save
        redirect_to admin_users_path, notice: t("flash.user_created")
      else
        redirect_to admin_users_path, inertia: { errors: @user.errors }
      end
    end

    def edit
      authorize @user
      render inertia: "admin/Users", props: {
        users: users_list,
        editUser: admin_user_json(@user)
      }
    end

    def update
      authorize @user
      if @user.update(user_params)
        redirect_to admin_users_path, notice: t("flash.user_updated")
      else
        redirect_to edit_admin_user_path(@user), inertia: { errors: @user.errors }
      end
    end

    def destroy
      authorize @user
      @user.discard
      redirect_to admin_users_path, notice: t("flash.user_deactivated")
    end

    def gdpr_delete
      authorize @user, :destroy?
      @user.discard
      redirect_to admin_users_path, notice: t("flash.user_gdpr_deleted")
    end

    def assign_role
      authorize @user, :update?
      role = Role.find_by!(name: params[:role_name])
      @user.roles << role unless @user.roles.include?(role)
      redirect_to admin_users_path, notice: t("flash.role_assigned")
    end

    def remove_role
      authorize @user, :update?
      role = Role.find_by!(name: params[:role_name])
      @user.roles.delete(role)
      redirect_to admin_users_path, notice: t("flash.role_removed")
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def users_list
      policy_scope(User).includes(:roles).order(created_at: :desc).map { |u| admin_user_json(u) }
    end

    def user_params
      params.require(:user).permit(:name, :email_address, :password, :locale, :has_homologation, :has_education)
    end

    def admin_user_json(u)
      { id: u.id, name: u.name, email: u.email_address,
        roles: u.roles.map(&:name), locale: u.locale,
        avatarUrl: u.avatar_url, createdAt: u.created_at.iso8601,
        discarded: u.discarded?,
        deletionRequestedAt: u.deletion_requested_at&.iso8601 }
    end
  end
end
