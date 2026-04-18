require "test_helper"
require "ostruct"

class StripeCheckoutServiceTest < ActiveSupport::TestCase
  setup do
    @admin = create(:user, :super_admin)
    @student = create(:user, :student)
    @request_record = create(:homologation_request, :submitted, user: @student)
    @request_record.update!(status: "awaiting_payment")

    @mock_customer = OpenStruct.new(id: "cus_test_new")
    @mock_session = OpenStruct.new(id: "cs_test_123", url: "https://checkout.stripe.com/test")
    @captured_session_args = nil
    @captured_customer_args = nil
  end

  test "creates session and returns it on success" do
    with_stripe_stubs do
      service = StripeCheckoutService.new(@request_record, created_by: @admin)
      session = service.create_session(amount: 150)
      assert_equal "cs_test_123", session.id
    end
  end

  test "converts euros to cents (integer) in line_items" do
    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 150)
      line_item = @captured_session_args[:line_items].first
      assert_equal 15_000, line_item[:price_data][:unit_amount]
      assert_kind_of Integer, line_item[:price_data][:unit_amount]
      assert_equal "eur", line_item[:price_data][:currency]
    end
  end

  test "handles decimal euro amounts with rounding" do
    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 99.99)
      assert_equal 9_999, @captured_session_args[:line_items].first[:price_data][:unit_amount]
    end
  end

  test "sends metadata with request id, amount, and created_by" do
    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 200)
      meta = @captured_session_args[:metadata]
      assert_equal @request_record.id, meta[:homologation_request_id]
      assert_equal "200", meta[:amount]
      assert_equal @admin.id, meta[:created_by]
    end
  end

  test "success_url and cancel_url include request id and payment status" do
    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 100)
      assert_match %r{/requests/#{@request_record.id}\?payment=success\z}, @captured_session_args[:success_url]
      assert_match %r{/requests/#{@request_record.id}\?payment=cancelled\z}, @captured_session_args[:cancel_url]
    end
  end

  test "creates a new Stripe customer when student has no stripe_customer_id" do
    assert_nil @student.stripe_customer_id

    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 100)
    end

    # Customer.create was called with the student's info
    assert_equal @student.email_address, @captured_customer_args[:email]
    assert_equal @student.name, @captured_customer_args[:name]
    assert_equal @student.id, @captured_customer_args[:metadata][:user_id]

    # Student record was updated with the new customer id
    assert_equal "cus_test_new", @student.reload.stripe_customer_id
  end

  test "reuses existing Stripe customer when student already has stripe_customer_id" do
    @student.update!(stripe_customer_id: "cus_existing")
    retrieved = OpenStruct.new(id: "cus_existing")

    with_stripe_stubs(customer_retrieve: retrieved) do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 100)
    end

    # Customer.create was NOT called, retrieve was
    assert_nil @captured_customer_args, "Stripe::Customer.create should not be called when id exists"
    assert_equal "cus_existing", @captured_session_args[:customer]
    # stripe_customer_id on student unchanged
    assert_equal "cus_existing", @student.reload.stripe_customer_id
  end

  test "wraps Stripe::StripeError in StripeCheckoutService::Error" do
    original_create = Stripe::Customer.method(:create)
    Stripe::Customer.define_singleton_method(:create) { |**_|
      raise Stripe::InvalidRequestError.new("Amount too small", "amount")
    }

    error = assert_raises(StripeCheckoutService::Error) do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 0.01)
    end
    assert_equal "Amount too small", error.message
  ensure
    Stripe::Customer.define_singleton_method(:create, original_create)
  end

  test "wraps Stripe session creation error" do
    original_customer_create = Stripe::Customer.method(:create)
    original_session_create = Stripe::Checkout::Session.method(:create)
    Stripe::Customer.define_singleton_method(:create) { |**_| OpenStruct.new(id: "cus_ok") }
    Stripe::Checkout::Session.define_singleton_method(:create) { |**_|
      raise Stripe::APIConnectionError.new("network down")
    }

    error = assert_raises(StripeCheckoutService::Error) do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 100)
    end
    assert_equal "network down", error.message
  ensure
    Stripe::Customer.define_singleton_method(:create, original_customer_create)
    Stripe::Checkout::Session.define_singleton_method(:create, original_session_create)
  end

  test "uses payment mode and single line item quantity 1" do
    with_stripe_stubs do
      StripeCheckoutService.new(@request_record, created_by: @admin).create_session(amount: 100)
      assert_equal "payment", @captured_session_args[:mode]
      assert_equal 1, @captured_session_args[:line_items].length
      assert_equal 1, @captured_session_args[:line_items].first[:quantity]
    end
  end

  private

  # Stubs Stripe::Customer.create (or .retrieve if given) and Stripe::Checkout::Session.create,
  # capturing kwargs on the test instance so the block body can assert on them.
  def with_stripe_stubs(customer_retrieve: nil)
    original_customer_create = Stripe::Customer.method(:create)
    original_customer_retrieve = Stripe::Customer.method(:retrieve)
    original_session_create = Stripe::Checkout::Session.method(:create)
    mock_customer = @mock_customer
    mock_session = @mock_session
    test_instance = self

    Stripe::Customer.define_singleton_method(:create) do |**kwargs|
      test_instance.instance_variable_set(:@captured_customer_args, kwargs)
      mock_customer
    end
    if customer_retrieve
      Stripe::Customer.define_singleton_method(:retrieve) { |_id| customer_retrieve }
    end
    Stripe::Checkout::Session.define_singleton_method(:create) do |**kwargs|
      test_instance.instance_variable_set(:@captured_session_args, kwargs)
      mock_session
    end

    yield
  ensure
    Stripe::Customer.define_singleton_method(:create, original_customer_create)
    Stripe::Customer.define_singleton_method(:retrieve, original_customer_retrieve)
    Stripe::Checkout::Session.define_singleton_method(:create, original_session_create)
  end
end
