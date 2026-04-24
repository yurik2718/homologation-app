class DropReferralSourceFromHomologationRequests < ActiveRecord::Migration[8.1]
  def change
    remove_column :homologation_requests, :referral_source, :string
  end
end
