class DatabaseBackupJob < ApplicationJob
  queue_as :default

  DATABASES = %w[production production_cache production_queue production_cable].freeze
  MAX_BACKUPS = 7

  def perform
    backup_dir = Rails.root.join("storage", "backups")
    FileUtils.mkdir_p(backup_dir)

    timestamp = Time.current.strftime("%Y%m%d_%H%M%S")

    DATABASES.each do |db_name|
      source = Rails.root.join("storage", "#{db_name}.sqlite3")
      next unless File.exist?(source)

      dest = backup_dir.join("#{db_name}_#{timestamp}.sqlite3")

      begin
        # Use SQLite3 Ruby gem's backup API: consistent online backup even during writes
        src_db = SQLite3::Database.new(source.to_s)
        dst_db = SQLite3::Database.new(dest.to_s)
        b = SQLite3::Backup.new(dst_db, "main", src_db, "main")
        b.step(-1)
        b.finish

        Rails.logger.info("[DatabaseBackupJob] Backed up #{db_name} → #{dest.basename}")
      rescue => e
        Rails.logger.error("[DatabaseBackupJob] FAILED #{db_name}: #{e.message}")
        File.delete(dest) if dest && File.exist?(dest)
      ensure
        dst_db&.close
        src_db&.close
      end
    end

    cleanup_old_backups(backup_dir)
  end

  private

  def cleanup_old_backups(backup_dir)
    DATABASES.each do |db_name|
      backups = Dir.glob(backup_dir.join("#{db_name}_*.sqlite3")).sort
      next if backups.size <= MAX_BACKUPS

      backups[0...-MAX_BACKUPS].each do |old_backup|
        File.delete(old_backup)
        Rails.logger.info("[DatabaseBackupJob] Deleted old backup #{File.basename(old_backup)}")
      end
    end
  end
end
