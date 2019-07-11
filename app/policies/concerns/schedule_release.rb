module Concerns::ScheduleRelease
  def has_schedule_release_permissions?(convention, schedule_release_value)
    case schedule_release_value
    when 'yes' then true
    when 'gms'
      has_privilege_in_convention?(convention, :con_com, :scheduling, :gm_liaison) ||
        team_member_in_convention?(convention)
    when 'priv'
      has_privilege_in_convention?(convention, :scheduling, :gm_liaison)
    else
      false
    end
  end

  def conventions_with_schedule_release_permissions(schedule_release_field)
    Queries::DisjunctiveWhere.build(Convention.all) do |dw|
      dw.add(schedule_release_field => 'yes')
      dw.add(schedule_release_field => 'gms', id: conventions_where_team_member)
      dw.add(
        schedule_release_field => 'gms',
        id: conventions_with_privilege(:con_com, :scheduling, :gm_liaison)
      )
      dw.add(
        schedule_release_field => 'priv',
        id: conventions_with_privilege(:scheduling, :gm_liaison)
      )
    end
  end
end