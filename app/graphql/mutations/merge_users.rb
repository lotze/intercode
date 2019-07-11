class Mutations::MergeUsers < Mutations::BaseMutation
  field :user, Types::UserType, null: false

  argument :user_ids, [Integer], required: true
  argument :winning_user_id, Integer, required: true
  argument :winning_user_con_profiles, [Types::WinningUserConProfileInputType], required: true

  def authorized?(args)
    users = User.find(args[:user_ids])
    users.all? { |user| policy(user).merge? }
  end

  def resolve(user_ids:, winning_user_id:, winning_user_con_profiles:)
    winning_profile_ids_by_convention_id = winning_user_con_profiles
      .index_by { |winning_profile| winning_profile[:convention_id] }
      .transform_values { |winning_profile| winning_profile[:user_con_profile_id] }

    result = MergeUsersService.new(
      user_ids: user_ids,
      winning_user_id: winning_user_id,
      winning_user_con_profile_ids_by_convention_id: winning_profile_ids_by_convention_id
    ).call!

    { user: result.winning_user }
  end
end
