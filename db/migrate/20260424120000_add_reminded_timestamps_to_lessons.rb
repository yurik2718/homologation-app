class AddRemindedTimestampsToLessons < ActiveRecord::Migration[8.1]
  def change
    add_column :lessons, :reminded_1h_at,  :datetime
    add_column :lessons, :reminded_24h_at, :datetime
  end
end
