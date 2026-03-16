Rails.application.routes.draw do
  resource :session, only: [ :new, :create, :destroy ]
  resource :registration, only: [ :new, :create ]
  resources :passwords, param: :token, only: [ :new, :create, :edit, :update ]
  resource :profile, only: [ :edit, :update ] do
    post :connect_telegram
    delete :disconnect_telegram
  end

  # OAuth
  post "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/failure",            to: "auth/omniauth_callbacks#failure"

  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end
  root "dashboard#index"

  resources :homologation_requests, path: "requests" do
    resources :messages, only: [ :create ]
    member do
      get  :download_document
      post :confirm_payment
    end
  end

  resources :conversations, only: [ :index, :show ] do
    resources :messages, only: [ :create ]
  end

  resources :inbox, only: [ :index, :show ]
  resources :lessons, only: [ :index, :create, :show, :update, :destroy ]
  namespace :admin do
    resources :lessons, only: [ :index ]
  end
  resources :notifications, only: [ :index, :update ] do
    collection do
      post :mark_all_read
    end
  end

  post "/telegram/webhook", to: "telegram#webhook"

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
