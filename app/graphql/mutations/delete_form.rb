class Mutations::DeleteForm < Mutations::BaseMutation
  field :form, Types::FormType, null: false, camelize: false

  argument :id, Int, required: true, camelize: false

  load_and_authorize_convention_associated_model :forms, :id, :destroy

  def resolve(**_args)
    form.destroy!
    { form: form }
  end
end
