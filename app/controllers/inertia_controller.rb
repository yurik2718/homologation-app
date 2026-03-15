# frozen_string_literal: true

# Base controller for all Inertia-rendered pages.
# Authentication and authorization hooks are added here in Step 1,
# so every page controller gets them automatically by inheriting from this class.
class InertiaController < ApplicationController
  # Step 1: include Authentication
  # Step 1: after_action :verify_authorized
end
