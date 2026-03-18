# Seed the admin user so db:reset always has an admin ready to go.
# Uses find_or_create_by on pubkey_hex so it's idempotent.

admin = User.find_or_create_by!(pubkey_hex: "be5966f5404264b2d763ec2ae3610df2971635a88d03cf077022463fd2d4cb5b") do |u|
  u.npub = "npub1hevkda2qgfjt94mras4wxcgd72t3vddg35pu7pmsyfrrl5k5edds9c9amk"
  u.display_name = "RB"
  u.weight = 245.0
  u.height = 71.0
  u.date_of_birth = "1975-02-25"
  u.sex = "male"
  u.race_ethnicity = "White"
  u.activity_level = "moderately_active"
  u.health_concerns = "High Blood Pressure"
  u.blood_pressure_systolic = 140
  u.blood_pressure_diastolic = 90
  u.goal = "lose_weight"
  u.timezone = "Eastern Time (US & Canada)"
  u.prayer_goal_minutes = 5
  u.water_goal_cups = 16.0
  u.fasting_start_hour = 20
  u.admin = true
end

# Ensure admin flag is set even if user already existed
admin.update!(admin: true) unless admin.admin?

puts "Admin user ready: #{admin.display_name} (#{admin.short_npub})"
