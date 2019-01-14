class Permission < ApplicationRecord
  belongs_to :staff_position
  belongs_to :event_category

  scope :for_user, ->(user) do
    where(
      staff_position_id: StaffPosition.joins(:user_con_profiles).where(user_con_profiles: { user_id: user.id })
    )
  end

  scope :for_model, ->(model) do
    case model
    when EventCategory then where(event_category_id: model.id)
    else raise InvalidArgument, "Permission does not support #{model.class} models"
    end
  end

  def model
    event_category
  end

  def model=(new_model)
    case new_model
    when EventCategory
      self.event_category = new_model
    else
      raise InvalidArgument, "Permission does not support #{new_model.class} models"
    end
  end
end