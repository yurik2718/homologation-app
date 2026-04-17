module ApplicationHelper
  # Locale-aware preload of Geist Variable woff2 files.
  # Ships only the subsets the current locale actually renders to avoid
  # burning bandwidth on fonts the user will never paint.
  GEIST_LATIN_FILES = %w[
    geist-latin-wght-normal.woff2
    geist-latin-ext-wght-normal.woff2
  ].freeze
  GEIST_CYRILLIC_FILES = %w[
    geist-cyrillic-wght-normal.woff2
    geist-latin-wght-normal.woff2
  ].freeze

  def geist_font_preload_tags(locale)
    files = locale.to_s == "ru" ? GEIST_CYRILLIC_FILES : GEIST_LATIN_FILES
    files.filter_map { |f| geist_font_href(f) }
         .map { |href| tag.link(rel: "preload", href: href, as: "font", type: "font/woff2", crossorigin: "anonymous") }
         .join.html_safe
  end

  # Emit a modulepreload for the active locale's translation bundle. The bundle
  # is code-split (see `lib/i18n.ts`) so React can't render until it arrives;
  # without a preload hint the fetch waits for `inertia.js` to start executing,
  # adding one full RTT to LCP on slow networks.
  def locale_bundle_preload_tag(locale)
    href = vite_manifest_file_for("locales/#{locale}.json")
    return "".html_safe unless href
    tag.link(rel: "modulepreload", href: href, as: "script", crossorigin: "anonymous")
  end

  private

  def vite_manifest_file_for(key)
    return nil if ViteRuby.instance.dev_server_running?
    entry = ViteRuby.instance.manifest.send(:find_manifest_entry, key)
    entry && entry["file"]
  rescue StandardError
    nil
  end

  # Resolve a woff2 shipped by @fontsource-variable/geist to its hashed URL
  # via the Vite manifest. Returns nil in dev (no manifest) and on lookup miss.
  def geist_font_href(basename)
    vite_manifest_file_for("../../node_modules/@fontsource-variable/geist/files/#{basename}")
  end
end
