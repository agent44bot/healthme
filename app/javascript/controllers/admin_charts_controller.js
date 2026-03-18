import { Controller } from "@hotwired/stimulus"
import "chart.js/auto"

export default class extends Controller {
  static targets = ["deviceChart", "platformChart", "visitsChart", "mobileDesktopChart", "signupsChart", "browserChart", "osChart"]
  static values = { url: String }

  connect() {
    this.renderPieCharts()
    this.loadTimeSeriesData()
  }

  renderPieCharts() {
    // Device chart - read from breakdown list
    if (this.hasDeviceChartTarget) {
      const data = this.extractBreakdown(this.deviceChartTarget)
      this.createPie(this.deviceChartTarget, data.labels, data.values, ["#2563eb", "#f59e0b", "#10b981"])
    }

    // Platform chart
    if (this.hasPlatformChartTarget) {
      const data = this.extractBreakdown(this.platformChartTarget)
      this.createPie(this.platformChartTarget, data.labels, data.values, ["#8b5cf6", "#06b6d4"])
    }

    // Browser chart
    if (this.hasBrowserChartTarget) {
      const data = this.extractBreakdown(this.browserChartTarget)
      this.createPie(this.browserChartTarget, data.labels, data.values, ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"])
    }

    // OS chart
    if (this.hasOsChartTarget) {
      const data = this.extractBreakdown(this.osChartTarget)
      this.createPie(this.osChartTarget, data.labels, data.values, ["#1e293b", "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"])
    }
  }

  extractBreakdown(canvas) {
    const list = canvas.parentElement.querySelector(".admin-breakdown-list")
    const labels = []
    const values = []
    if (list) {
      list.querySelectorAll(".admin-breakdown-row").forEach(row => {
        labels.push(row.querySelector(".admin-breakdown-label").textContent.trim())
        values.push(parseInt(row.querySelector(".admin-breakdown-value").textContent.trim()) || 0)
      })
    }
    return { labels, values }
  }

  createPie(canvas, labels, values, colors) {
    if (values.every(v => v === 0)) return

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12 } } }
        }
      }
    })
  }

  async loadTimeSeriesData() {
    try {
      const response = await fetch(this.urlValue)
      const data = await response.json()

      const dates = this.getLast30Days()

      if (this.hasVisitsChartTarget) {
        this.createLine(this.visitsChartTarget, dates, [
          { label: "Total Visits", data: dates.map(d => data.visits_by_day[d] || 0), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.1)" },
          { label: "Unique Visitors", data: dates.map(d => data.unique_by_day[d] || 0), borderColor: "#10b981", backgroundColor: "rgba(16,163,161,0.1)" }
        ])
      }

      if (this.hasMobileDesktopChartTarget) {
        this.createLine(this.mobileDesktopChartTarget, dates, [
          { label: "Mobile", data: dates.map(d => data.mobile_by_day[d] || 0), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)" },
          { label: "Desktop", data: dates.map(d => data.desktop_by_day[d] || 0), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.1)" }
        ])
      }

      if (this.hasSignupsChartTarget) {
        this.createLine(this.signupsChartTarget, dates, [
          { label: "New Signups", data: dates.map(d => data.signups_by_day[d] || 0), borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.1)", fill: true }
        ])
      }
    } catch (e) {
      console.error("Failed to load admin chart data:", e)
    }
  }

  createLine(canvas, labels, datasets) {
    new Chart(canvas, {
      type: "line",
      data: {
        labels: labels.map(d => {
          const date = new Date(d + "T00:00:00")
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }),
        datasets: datasets.map(ds => ({
          ...ds,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
          fill: ds.fill || false
        }))
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { ticks: { maxTicksToShow: 10 } }
        },
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12 } } }
        }
      }
    })
  }

  getLast30Days() {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split("T")[0])
    }
    return days
  }
}
