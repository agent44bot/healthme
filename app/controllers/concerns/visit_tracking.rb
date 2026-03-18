module VisitTracking
  extend ActiveSupport::Concern

  included do
    after_action :track_visit, if: :trackable_request?
  end

  private

  def trackable_request?
    request.get? && response.successful? && !request.path.start_with?("/admin")
  end

  def track_visit
    Visit.create(
      user: current_user,
      path: request.path,
      method: request.method,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      referrer: request.referrer,
      status_code: response.status
    )
  rescue StandardError => e
    Rails.logger.warn("Visit tracking failed: #{e.message}")
  end
end
