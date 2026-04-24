class DropCoordinatorIdFromHomologationRequests < ActiveRecord::Migration[8.1]
  def change
    remove_foreign_key :homologation_requests, column: :coordinator_id
    remove_index       :homologation_requests, :coordinator_id
    remove_column      :homologation_requests, :coordinator_id, :integer
  end
end
