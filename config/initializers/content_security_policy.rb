Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :https, :data
    policy.img_src     :self, :https, :data, :blob
    policy.object_src  :none
    policy.script_src  :self
    policy.style_src   :self, :unsafe_inline  # Tailwind CSS requires inline styles
    policy.connect_src :self, :https           # Action Cable WebSocket uses same-origin
    policy.frame_src   :none
    policy.frame_ancestors :none              # Prevents clickjacking (replaces X-Frame-Options: DENY)
    policy.worker_src  :blob                  # Vite worker bundles

    if Rails.env.development?
      vite_host = "http://#{ViteRuby.config.host_with_port}"
      ws_host   = "ws://#{ViteRuby.config.host_with_port}"
      # :unsafe_inline is required for Vite's React Refresh preamble (inline <script>)
      policy.script_src *policy.script_src, :unsafe_inline, :unsafe_eval, vite_host
      policy.style_src  *policy.style_src, vite_host
      policy.connect_src *policy.connect_src, vite_host, ws_host
    end
  end
end
