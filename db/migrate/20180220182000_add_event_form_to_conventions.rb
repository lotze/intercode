class AddEventFormToConventions < ActiveRecord::Migration[5.1]
  def change
    add_reference :conventions, :regular_event_form, foreign_key: { to_table: 'forms' }
    add_reference :conventions, :volunteer_event_form, foreign_key: { to_table: 'forms' }
    add_reference :conventions, :filler_event_form, foreign_key: { to_table: 'forms' }

    reversible do |dir|
      dir.up do
        Convention.reset_column_information
        Convention.find_each do |convention|
          %w[regular volunteer filler].each do |event_form_type|
            form = Form.create!(
              convention: convention,
              title: "#{event_form_type.capitalize} event form"
            )
            convention.assign_attributes("#{event_form_type}_event_form" => form)
            content_path = File.expand_path(
              "cms_content_sets/standard/forms/#{event_form_type}_event_form.json",
              Rails.root
            )
            ImportFormContentService.new(
              form: form,
              content: JSON.parse(File.read(content_path))
            ).call!
          end
          convention.save!
        end
      end
    end
  end
end
