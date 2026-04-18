class StripeWebhooksController < ActionController::API
  def create
    payload = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
    endpoint_secret = Rails.application.credentials.dig(:stripe, :webhook_secret)

    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError
      head :bad_request and return
    rescue Stripe::SignatureVerificationError
      head :bad_request and return
    end

    case event.type
    when "checkout.session.completed"
      handle_checkout_completed(event.data.object)
    end

    head :ok
  end

  private

  def handle_checkout_completed(session)
    request_id = session.metadata["homologation_request_id"]
    confirmed_by_id = session.metadata["created_by"]

    hr = HomologationRequest.find_by(id: request_id)
    return unless hr

    amount = BigDecimal(session.metadata["amount"].to_s)
    return unless amount.positive?
    return unless hr.status == "awaiting_payment"

    confirmer = User.find_by(id: confirmed_by_id)
    return unless confirmer

    ActiveRecord::Base.transaction do
      hr.update!(
        payment_amount: amount,
        payment_confirmed_by: confirmer.id,
        stripe_payment_intent_id: session.payment_intent
      )
      hr.transition_to!("payment_confirmed", changed_by: confirmer)
      hr.enter_pipeline!
    end

    AmoCrmSyncJob.perform_later(hr.id)
    # Notify student
    NotificationJob.perform_later(
      user_id: hr.user_id,
      title: I18n.t("notifications.payment_confirmed",
                     amount: hr.payment_amount.to_f,
                     subject: hr.subject),
      notifiable: hr
    )
    # Notify admin/coordinator who created the Stripe link
    NotificationJob.perform_later(
      user_id: confirmer.id,
      title: I18n.t("notifications.stripe_payment_received",
                     amount: hr.payment_amount.to_f,
                     student: hr.user.name),
      notifiable: hr
    )
  end
end
