class Visit < ApplicationRecord
  belongs_to :user, optional: true

  DEVICE_TYPES = %w[desktop mobile tablet].freeze
  PLATFORMS = %w[ios_app web].freeze

  scope :today, -> { where(created_at: Time.current.beginning_of_day..) }
  scope :this_week, -> { where(created_at: 7.days.ago..) }
  scope :this_month, -> { where(created_at: 30.days.ago..) }
  scope :mobile, -> { where(device_type: "mobile") }
  scope :desktop, -> { where(device_type: "desktop") }
  scope :tablet, -> { where(device_type: "tablet") }
  scope :ios_app, -> { where(platform: "ios_app") }
  scope :web, -> { where(platform: "web") }

  before_validation :detect_device_info, if: -> { user_agent.present? && device_type.blank? }

  private

  def detect_device_info
    ua = user_agent.to_s.downcase

    # Platform detection: Capacitor iOS app vs web
    self.platform = if ua.include?("capacitor") || ua.include?("healthme")
                      "ios_app"
                    else
                      "web"
                    end

    # Device type detection
    self.device_type = if ua.match?(/ipad|tablet|kindle|silk/)
                         "tablet"
                       elsif ua.match?(/iphone|ipod|android.*mobile|mobile|opera mini|iemobile/)
                         "mobile"
                       else
                         "desktop"
                       end

    # Browser detection
    self.browser = if ua.include?("crios")
                     "Chrome iOS"
                   elsif ua.include?("fxios")
                     "Firefox iOS"
                   elsif ua.include?("edg")
                     "Edge"
                   elsif ua.include?("chrome") && !ua.include?("chromium")
                     "Chrome"
                   elsif ua.include?("safari") && !ua.include?("chrome")
                     "Safari"
                   elsif ua.include?("firefox")
                     "Firefox"
                   else
                     "Other"
                   end

    # OS detection
    self.os = if ua.include?("iphone") || ua.include?("ipad") || ua.include?("ipod")
                "iOS"
              elsif ua.include?("mac os")
                "macOS"
              elsif ua.include?("android")
                "Android"
              elsif ua.include?("windows")
                "Windows"
              elsif ua.include?("linux")
                "Linux"
              else
                "Other"
              end
  end
end
