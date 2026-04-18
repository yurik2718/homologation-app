require "test_helper"

class ApplicationCable::ConnectionTest < ActionCable::Connection::TestCase
  # ApplicationCable::Connection is the auth-gate for ALL real-time sockets.
  # If this fails open, any visitor can subscribe to any channel. Lock it down.

  test "connects an authenticated user via signed session_id cookie" do
    user = create(:user, :student)
    session = user.sessions.create!
    cookies.signed[:session_id] = session.id

    connect
    assert_equal user, connection.current_user
  end

  test "rejects connection when no session cookie is present" do
    assert_reject_connection { connect }
  end

  test "rejects connection when session_id cookie points to a nonexistent session" do
    cookies.signed[:session_id] = 999_999
    assert_reject_connection { connect }
  end

  test "rejects connection when session_id cookie is forged (unsigned)" do
    session = create(:user, :student).sessions.create!
    cookies[:session_id] = session.id  # plain cookie, not signed
    assert_reject_connection { connect }
  end
end
