class AddAwaitingReplyRemindedAtToHomologationRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :homologation_requests, :awaiting_reply_reminded_at, :datetime
  end
end
