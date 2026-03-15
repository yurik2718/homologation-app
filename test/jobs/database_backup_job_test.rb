require "test_helper"

class DatabaseBackupJobTest < ActiveJob::TestCase
  setup do
    @backup_dir = Rails.root.join("storage", "backups")
    FileUtils.rm_rf(@backup_dir)
  end

  teardown do
    FileUtils.rm_rf(@backup_dir)
  end

  test "creates backup directory and backup files" do
    # Create a test source database
    source = Rails.root.join("storage", "production.sqlite3")
    FileUtils.cp(Rails.root.join("storage", "test.sqlite3"), source) unless File.exist?(source)

    DatabaseBackupJob.perform_now

    assert Dir.exist?(@backup_dir), "Backup directory should be created"
    backups = Dir.glob(@backup_dir.join("production_*.sqlite3"))
    assert backups.any?, "Should create at least one backup file"
  end

  test "cleans up old backups beyond MAX_BACKUPS" do
    FileUtils.mkdir_p(@backup_dir)

    # Create 9 fake old backups (exceeds MAX_BACKUPS=7)
    9.times do |i|
      ts = (10 - i).days.ago.strftime("%Y%m%d_%H%M%S")
      FileUtils.touch(@backup_dir.join("production_#{ts}.sqlite3"))
    end

    source = Rails.root.join("storage", "production.sqlite3")
    FileUtils.cp(Rails.root.join("storage", "test.sqlite3"), source) unless File.exist?(source)

    DatabaseBackupJob.perform_now

    # 9 old + 1 new = 10, should keep only 7
    remaining = Dir.glob(@backup_dir.join("production_*.sqlite3"))
    assert_equal 7, remaining.size, "Should keep only #{DatabaseBackupJob::MAX_BACKUPS} backups"
  end
end
