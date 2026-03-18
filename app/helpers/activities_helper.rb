module ActivitiesHelper
  CATEGORY_ICONS = {
    "food" => "🍽️",
    "coffee" => "☕",
    "walk" => "🚶",
    "run" => "🏃",
    "weights" => "🏋️",
    "yoga" => "🧘",
    "sleep" => "😴",
    "water" => "💧",
    "prayer_meditation" => "🙏",
    "blood_pressure" => "❤️",
    "medication" => "💊",
    "body_weight" => "⚖️",
    "brush_teeth" => "🪥",
    "other" => "📝"
  }.freeze

  CATEGORY_LABELS = {
    "weights" => "Weight Training",
    "prayer_meditation" => "Prayer / Meditation",
    "blood_pressure" => "Blood Pressure",
    "medication" => "Medication / Supplement",
    "body_weight" => "Body Weight",
    "brush_teeth" => "Brush Teeth"
  }.freeze

  def category_icon(category)
    CATEGORY_ICONS[category] || "📝"
  end

  def category_label(category)
    CATEGORY_LABELS[category] || category.capitalize
  end

  def activity_tag_label(activity)
    parts = [ category_icon(activity.category) ]
    if activity.notes.present?
      parts << activity.notes.truncate(30)
    elsif activity.display_value
      parts << "#{category_label(activity.category)} #{activity.display_value}"
    else
      parts << category_label(activity.category)
    end
    if activity.calories.present? && activity.calories > 0
      parts << "(#{activity.calories} cal)"
    end
    parts.join(" ")
  end
end
