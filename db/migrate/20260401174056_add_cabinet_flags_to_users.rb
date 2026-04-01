class AddCabinetFlagsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :has_homologation, :boolean, null: false, default: false
    add_column :users, :has_education,    :boolean, null: false, default: false

    # Backfill existing users based on their roles
    reversible do |dir|
      dir.up do
        execute <<~SQL
          UPDATE users
          SET has_homologation = 1
          WHERE id IN (
            SELECT user_id FROM user_roles
            INNER JOIN roles ON roles.id = user_roles.role_id
            WHERE roles.name IN ('student', 'coordinator', 'super_admin')
          )
        SQL

        execute <<~SQL
          UPDATE users
          SET has_education = 1
          WHERE id IN (
            SELECT user_id FROM user_roles
            INNER JOIN roles ON roles.id = user_roles.role_id
            WHERE roles.name IN ('teacher', 'super_admin')
          )
        SQL
      end
    end
  end
end
