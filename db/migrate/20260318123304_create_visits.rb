class CreateVisits < ActiveRecord::Migration[8.1]
  def change
    create_table :visits do |t|
      t.references :user, foreign_key: true
      t.string :path
      t.string :method, default: "GET"
      t.string :ip_address
      t.string :user_agent
      t.string :referrer
      t.string :device_type    # desktop, mobile, tablet
      t.string :platform       # ios_app, web
      t.string :browser
      t.string :os
      t.integer :status_code
      t.timestamps
    end

    add_index :visits, :created_at
    add_index :visits, :device_type
    add_index :visits, :platform
  end
end
