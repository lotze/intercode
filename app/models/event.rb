class Event < ActiveRecord::Base

  # Most events belong to the user who proposes it.  Some (like ConSuite or
  # Ops) are owned by the department head
  belongs_to :user
  validates :user_id, presence: true, numericality: { only_integer: true }

  # LARPs have GMs and Panels have Members
  has_many :team_members

  # The user who last updated the event.  Used for tracking
  belongs_to :updated_by, :class_name => "User"

  # Each event must belong to a convention
  belongs_to :convention
  validates :convention, presence: true

  # Status specifies the status of the proposed event.  It must be one of
  # "Proposed", "Reviewing", "Accepted", "Rejected" or "Dropped".  Events
  # that need to be reviewed (LARPs, PreCon) must be reviewed and approved
  # by the approprite committee and default to "Proposed."  Events that don't
  # need to be approved (ConSuite, Ops, Filler) default to "Approved."
  validates :status,
    inclusion:
    { 
      :in => %w(Proposed Reviewing Accepted Rejected Dropped)
#      messsage: "%{value} is not a valid event status"
    }

  # All events for a Convention must have a unique title.  Ignore any events
  # that with a status of "Dropped" or "Rejected".  If they have a duplicate
  # title we don't care.
  validates_uniqueness_of :title,
    scope: :convention,
    conditions: -> { where.not(status: ['Dropped', 'Rejected']) }

  # Runs specify how many instances of this event there are on the schedule.
  # An event may have 0 or more runs.
  has_many :runs

#  validates :con_mail_destination, :inclusion => { :in => %w(game_email gms) }

  # Generate an array of times.  These can be used to create an option list
  # for a drop-down list, where the ID for each entry is the time of the
  # event in seconds.  Events are (currently) scheduled with a granularity
  # of 1/4 hours...
  def time_array (low_hour, high_hour)
    ary = Array.new
    (low_hour .. high_hour - 1).each do |h|
      (0 .. 45).step(15) do |m|
        s = '%02d:%02d' % [h, m]
        ary.push([s, h * 60 * 60 + m * 60])
      end
    end

    # Add the closing hour entry
    s = '%02d:00' % [high_hour]
    ary.push([s, high_hour * 60 *60])
  end

   # Generate an array of times for a LARP
   def larp_time_array
     time_array(2, 14)
   end

   # Generate array of visible team members for this event
   def visible_team_members
    TeamMember.where("event_id=?", self.id).where(display: true)
   end
end
