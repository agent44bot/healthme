module Admin
  class DashboardController < ApplicationController
    before_action :require_admin

    def show
      @total_users = User.count
      @total_visits = Visit.count
      @visits_today = Visit.today.count
      @visits_this_week = Visit.this_week.count
      @visits_this_month = Visit.this_month.count
      @unique_visitors_today = Visit.today.distinct.count(:ip_address)
      @unique_visitors_week = Visit.this_week.distinct.count(:ip_address)

      # Device breakdown
      @device_counts = Visit.group(:device_type).count
      @platform_counts = Visit.group(:platform).count

      # Recent visits
      @recent_visits = Visit.order(created_at: :desc).includes(:user).limit(50)

      # Users active today
      @active_users_today = User.where(id: Visit.today.select(:user_id)).count
      @active_users_week = User.where(id: Visit.this_week.select(:user_id)).count
      @active_users_month = User.where(id: Visit.this_month.select(:user_id)).count

      # Top pages
      @top_pages = Visit.this_month.group(:path).order("count_all desc").limit(10).count

      # Browser breakdown
      @browser_counts = Visit.this_month.where.not(browser: nil).group(:browser).order("count_all desc").count

      # OS breakdown
      @os_counts = Visit.this_month.where.not(os: nil).group(:os).order("count_all desc").count

      # Users list
      @users = User.order(created_at: :desc).limit(20)
    end

    def data
      days = (params[:days] || 30).to_i.clamp(1, 365)
      start_date = days.days.ago.beginning_of_day

      visits_by_day = Visit.where(created_at: start_date..)
                           .group("date(created_at)")
                           .count

      unique_by_day = Visit.where(created_at: start_date..)
                           .group("date(created_at)")
                           .distinct
                           .count(:ip_address)

      mobile_by_day = Visit.where(created_at: start_date.., device_type: "mobile")
                           .group("date(created_at)")
                           .count

      desktop_by_day = Visit.where(created_at: start_date.., device_type: "desktop")
                            .group("date(created_at)")
                            .count

      signups_by_day = User.where(created_at: start_date..)
                           .group("date(created_at)")
                           .count

      render json: {
        visits_by_day: visits_by_day,
        unique_by_day: unique_by_day,
        mobile_by_day: mobile_by_day,
        desktop_by_day: desktop_by_day,
        signups_by_day: signups_by_day
      }
    end

    private

    def require_admin
      unless current_user&.admin?
        redirect_to root_path, alert: "Not authorized."
      end
    end
  end
end
