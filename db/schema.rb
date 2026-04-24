# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_24_120002) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "amo_crm_tokens", force: :cascade do |t|
    t.text "access_token", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.text "refresh_token", null: false
    t.datetime "updated_at", null: false
  end

  create_table "conversation_participants", force: :cascade do |t|
    t.integer "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "last_read_at"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["conversation_id", "user_id"], name: "index_conversation_participants_on_conversation_id_and_user_id", unique: true
    t.index ["conversation_id"], name: "index_conversation_participants_on_conversation_id"
    t.index ["user_id", "last_read_at"], name: "index_conversation_participants_on_user_id_and_last_read_at"
    t.index ["user_id"], name: "index_conversation_participants_on_user_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "homologation_request_id"
    t.datetime "last_message_at"
    t.integer "teacher_student_id"
    t.datetime "updated_at", null: false
    t.index ["homologation_request_id"], name: "index_conversations_on_homologation_request_id", unique: true
    t.index ["last_message_at"], name: "index_conversations_on_last_message_at"
    t.index ["teacher_student_id"], name: "index_conversations_on_teacher_student_id"
  end

  create_table "homologation_requests", force: :cascade do |t|
    t.string "amo_crm_lead_id"
    t.text "amo_crm_sync_error"
    t.datetime "amo_crm_synced_at"
    t.datetime "awaiting_reply_reminded_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "discarded_at"
    t.json "document_checklist", default: {}
    t.string "education_system"
    t.string "identity_card"
    t.string "language_certificate"
    t.string "language_knowledge"
    t.string "passport"
    t.decimal "payment_amount", precision: 10, scale: 2
    t.datetime "payment_confirmed_at"
    t.integer "payment_confirmed_by"
    t.text "pipeline_notes"
    t.string "pipeline_stage"
    t.boolean "privacy_accepted", default: false, null: false
    t.string "referral_source"
    t.string "service_type", null: false
    t.string "status", default: "draft", null: false
    t.datetime "status_changed_at"
    t.integer "status_changed_by"
    t.string "stripe_payment_intent_id"
    t.string "studies_finished"
    t.string "studies_spain"
    t.string "study_type_spain"
    t.string "subject", null: false
    t.string "university"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.integer "year"
    t.index ["discarded_at"], name: "index_homologation_requests_on_discarded_at"
    t.index ["pipeline_stage"], name: "index_homologation_requests_on_pipeline_stage"
    t.index ["status"], name: "index_homologation_requests_on_status"
    t.index ["updated_at"], name: "index_homologation_requests_on_updated_at"
    t.index ["user_id", "status"], name: "index_homologation_requests_on_user_id_and_status"
    t.index ["user_id"], name: "index_homologation_requests_on_user_id"
  end

  create_table "lessons", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "duration_minutes", default: 60, null: false
    t.string "meeting_link"
    t.text "notes"
    t.datetime "reminded_1h_at"
    t.datetime "reminded_24h_at"
    t.datetime "scheduled_at", null: false
    t.string "status", default: "scheduled", null: false
    t.integer "student_id", null: false
    t.integer "teacher_id", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_lessons_on_status"
    t.index ["student_id", "scheduled_at"], name: "index_lessons_on_student_id_and_scheduled_at"
    t.index ["teacher_id", "scheduled_at"], name: "index_lessons_on_teacher_id_and_scheduled_at"
    t.index ["teacher_id"], name: "index_lessons_on_teacher_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.integer "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["conversation_id", "created_at"], name: "index_messages_on_conversation_id_and_created_at"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "emailed_at"
    t.integer "notifiable_id", null: false
    t.string "notifiable_type", null: false
    t.datetime "read_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable_type_and_notifiable_id"
    t.index ["user_id", "created_at"], name: "index_notifications_on_user_id_and_created_at"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "roles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_roles_on_name", unique: true
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "teacher_profiles", force: :cascade do |t|
    t.text "bio"
    t.datetime "created_at", null: false
    t.decimal "hourly_rate", precision: 8, scale: 2, null: false
    t.string "level", null: false
    t.string "permanent_meeting_link"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_teacher_profiles_on_user_id", unique: true
  end

  create_table "teacher_students", force: :cascade do |t|
    t.integer "assigned_by"
    t.datetime "created_at", null: false
    t.integer "student_id", null: false
    t.integer "teacher_id", null: false
    t.index ["student_id"], name: "index_teacher_students_on_student_id"
    t.index ["teacher_id", "student_id"], name: "index_teacher_students_on_teacher_id_and_student_id", unique: true
    t.index ["teacher_id"], name: "index_teacher_students_on_teacher_id"
  end

  create_table "user_roles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "role_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["role_id"], name: "index_user_roles_on_role_id"
    t.index ["user_id", "role_id"], name: "index_user_roles_on_user_id_and_role_id", unique: true
    t.index ["user_id"], name: "index_user_roles_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "amo_crm_contact_id"
    t.string "avatar_url"
    t.date "birthday"
    t.string "country"
    t.datetime "created_at", null: false
    t.datetime "deletion_requested_at"
    t.datetime "discarded_at"
    t.string "email_address", null: false
    t.string "guardian_email"
    t.string "guardian_name"
    t.string "guardian_phone"
    t.integer "guardian_user_id"
    t.string "guardian_whatsapp"
    t.boolean "has_education", default: false, null: false
    t.boolean "has_homologation", default: false, null: false
    t.boolean "is_minor", default: false, null: false
    t.string "locale", default: "es"
    t.string "name", default: "", null: false
    t.boolean "notification_email", default: true, null: false
    t.boolean "notification_telegram", default: false, null: false
    t.string "password_digest", null: false
    t.string "phone"
    t.datetime "privacy_accepted_at"
    t.string "provider"
    t.datetime "purge_scheduled_at"
    t.string "stripe_customer_id"
    t.string "telegram_chat_id"
    t.string "telegram_link_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.string "whatsapp"
    t.index ["deletion_requested_at"], name: "index_users_on_deletion_requested_at"
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
    t.index ["guardian_user_id"], name: "index_users_on_guardian_user_id"
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "conversation_participants", "conversations"
  add_foreign_key "conversation_participants", "users"
  add_foreign_key "conversations", "homologation_requests"
  add_foreign_key "conversations", "teacher_students"
  add_foreign_key "homologation_requests", "users"
  add_foreign_key "homologation_requests", "users", column: "payment_confirmed_by"
  add_foreign_key "homologation_requests", "users", column: "status_changed_by"
  add_foreign_key "lessons", "users", column: "student_id"
  add_foreign_key "lessons", "users", column: "teacher_id"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users"
  add_foreign_key "notifications", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "teacher_profiles", "users"
  add_foreign_key "teacher_students", "users", column: "assigned_by"
  add_foreign_key "teacher_students", "users", column: "student_id"
  add_foreign_key "teacher_students", "users", column: "teacher_id"
  add_foreign_key "user_roles", "roles"
  add_foreign_key "user_roles", "users"
end
