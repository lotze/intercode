import React from 'react';
import { flatMap } from 'lodash';
import BootstrapFormInput from '../BuiltInFormControls/BootstrapFormInput';

import { Transforms, useMutator } from '../ComposableFormUtils';
import { useChangeSet, useChangeSetWithSelect } from '../ChangeSet';
import UserSelect from '../BuiltInFormControls/UserSelect';
import PermissionNames from '../../../config/permission_names.json';
import PermissionsTableInput from '../BuiltInFormControls/PermissionsTableInput';

const OrganizationRolePermissionNames = flatMap(
  PermissionNames.filter(
    permissionNameGroup => permissionNameGroup.role_type === 'OrganizationRole',
  ),
  permissionNameGroup => permissionNameGroup.permissions,
);

export default function useOrganizationRoleForm(initialOrganizationRole) {
  const [organizationRole, organizationRoleMutator] = useMutator(
    initialOrganizationRole || {},
    {
      name: Transforms.textInputChange,
    },
  );
  const [usersChangeSet, onChangeUsers] = useChangeSetWithSelect();
  const [permissionsChangeSet, addPermission, removePermission] = useChangeSet();

  const initialPermissions = organizationRole.permissions
    .map(permission => ({ ...permission, model: organizationRole }));

  const renderForm = () => (
    <>
      <BootstrapFormInput
        name="name"
        label="Role name"
        value={organizationRole.name}
        onChange={organizationRoleMutator.name}
      />

      <div className="form-group">
        <label htmlFor="users">Users</label>
        <UserSelect
          isMulti
          inputId="users"
          value={usersChangeSet.apply(organizationRole.users)}
          onChange={onChangeUsers}
        />
      </div>

      <fieldset>
        <caption>Permissions</caption>

        <PermissionsTableInput
          permissionNames={OrganizationRolePermissionNames}
          initialPermissions={initialPermissions}
          models={[organizationRole]}
          changeSet={permissionsChangeSet}
          add={addPermission}
          remove={removePermission}
          formatModelHeader={() => 'Permitted?'}
        />
      </fieldset>
    </>
  );

  return {
    renderForm,
    formState: {
      organizationRole,
      usersChangeSet,
      permissionsChangeSet,
    },
  };
}