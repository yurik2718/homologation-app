Rails.application.routes.draw do
  resource :session, only: [ :new, :create, :destroy ]
  resource :registration, only: [ :new, :create ]
  resources :passwords, param: :token, only: [ :new, :create, :edit, :update ]
  resource :profile, only: [ :edit, :update ] do
    post :connect_telegram
    delete :disconnect_telegram
  end

  # Settings (replaces profile/edit)
  get  "settings",                    to: redirect("/settings/profile")
  get  "settings/profile",            to: "settings#profile",        as: :settings_profile
  patch "settings/profile",           to: "settings#update_profile"
  get "settings/account",            to: "settings#account",        as: :settings_account
  patch "settings/account",           to: "settings#update_account"
  get "settings/notifications",      to: "settings#notifications",  as: :settings_notifications
  patch "settings/notifications",     to: "settings#update_notifications"
  post "settings/request_deletion",   to: "settings#request_deletion",   as: :settings_request_deletion
  get  "settings/data-export",        to: "settings#data_export",         as: :settings_data_export
  post "settings/connect_telegram",   to: "settings#connect_telegram",   as: :settings_connect_telegram
  delete "settings/disconnect_telegram", to: "settings#disconnect_telegram", as: :settings_disconnect_telegram

  # OAuth
  post "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/failure",            to: "auth/omniauth_callbacks#failure"

  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  # Root: detect browser language → redirect to /:locale/
  root "pages#redirect_to_locale"

  # Public marketing pages — all languages with prefix, English slugs
  scope "/:locale", locale: /es|en|ru/ do
    get "/",             to: "pages#home",          as: :localized_home
    get "homologation",  to: "pages#homologation",  as: :localized_homologation
    get "university",    to: "pages#university",    as: :localized_university
    get "spanish",       to: "pages#spanish",       as: :localized_spanish
    get "pricing",       to: "pages#pricing",       as: :localized_pricing
    get "consultation-thank-you", to: "pages#consultation_thank_you", as: :localized_consultation_thank_you
  end

  # Authenticated app — logged-in users
  get "dashboard", to: "dashboard#index"

  resources :homologation_requests, path: "requests" do
    resources :messages, only: [ :create ]
    member do
      get  :download_document
      post :confirm_payment
      post :create_checkout_session
      post :retry_sync
    end
  end

  resources :conversations, only: [ :index, :show ] do
    resources :messages, only: [ :create ]
  end

  resources :chats, only: [ :index, :show ]
  resources :lessons, only: [ :index, :create, :show, :update, :destroy ]
  namespace :admin do
    root "dashboard#index"
    resources :users do
      member do
        post :assign_role
        delete :remove_role
        delete :gdpr_delete
      end
    end
    resources :lessons, only: [ :index ]
    get "pipeline", to: "pipeline#index", as: :pipeline
    patch "pipeline/:id", to: "pipeline#update", as: :pipeline_update
    patch "pipeline/:id/advance", to: "pipeline#advance", as: :pipeline_advance
    patch "pipeline/:id/retreat", to: "pipeline#retreat", as: :pipeline_retreat
  end

  get "privacy-policy", to: "pages#privacy_policy"
  resources :notifications, only: [ :index, :update ] do
    collection do
      post :mark_all_read
    end
  end

  post "/telegram/webhook", to: "telegram#webhook"
  post "/webhooks/stripe", to: "stripe_webhooks#create"

  resources :teachers, only: [ :index, :update ] do
    member do
      post :assign_student
      delete :remove_student
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
