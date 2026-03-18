namespace :admin do
  desc "Grant admin to a user by ID or first user if no ID given"
  task :grant, [ :user_id ] => :environment do |_t, args|
    user = if args[:user_id]
      User.find(args[:user_id])
    else
      User.first
    end

    if user
      user.update!(admin: true)
      puts "Granted admin to #{user.display_name || user.short_npub} (ID: #{user.id})"
    else
      puts "No users found."
    end
  end
end
