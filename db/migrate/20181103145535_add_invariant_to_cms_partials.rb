class AddInvariantToCmsPartials < ActiveRecord::Migration[5.2]
  def change
    add_column :cms_partials, :invariant, :boolean, null: false, default: false

    reversible do |dir|
      dir.up do
        CmsPartial.find_each do |cms_partial|
          cms_partial.send(:set_performance_metadata)
          cms_partial.save!
        end
      end
    end
  end
end
