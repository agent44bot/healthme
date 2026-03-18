require "test_helper"

class QuickUpdateTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:alice)
    @water = activities(:water_three_cups)
    sign_in_as(@user)
  end

  test "quick_update adds value to existing activity" do
    patch quick_update_activity_path(@water), params: { add_value: 3 }

    @water.reload
    assert_equal 6.0, @water.value
  end

  test "quick_update redirects to index with notice" do
    patch quick_update_activity_path(@water), params: { add_value: 2 }

    assert_redirected_to activities_path(date: @water.performed_on)
    follow_redirect!
    assert_match "Added", response.body
  end

  test "quick_update handles decimal values" do
    patch quick_update_activity_path(@water), params: { add_value: 1.5 }

    @water.reload
    assert_equal 4.5, @water.value
  end
end
