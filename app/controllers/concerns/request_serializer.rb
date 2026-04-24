module RequestSerializer
  def request_list_json(r, files_count: nil)
    base = {
      id: r.id, subject: r.subject, serviceType: r.service_type,
      status: r.status, createdAt: r.created_at.iso8601,
      updatedAt: r.updated_at.iso8601, user: { id: r.user.id, name: r.user.name }
    }
    base[:filesCount] = files_count unless files_count.nil?
    base
  end

  # Returns { request_id => attachment_count } for the given ids. One SQL query.
  def request_files_counts(request_ids)
    return {} if request_ids.empty?
    ActiveStorage::Attachment
      .where(record_type: "HomologationRequest", record_id: request_ids)
      .group(:record_id).count
  end
end
