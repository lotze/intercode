import React from 'react';
import {
  Switch, Route, useParams, useRouteMatch,
} from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import EditOrganizationRole from './EditOrganizationRole';
import NewOrganizationRole from './NewOrganizationRole';
import { OrganizationAdminOrganizationsQuery } from './queries.gql';
import OrganizationDisplay from './OrganizationDisplay';
import OrganizationIndex from './OrganizationIndex';
import ErrorDisplay from '../ErrorDisplay';
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem';
import LoadingIndicator from '../LoadingIndicator';
import RouteActivatedBreadcrumbItem from '../Breadcrumbs/RouteActivatedBreadcrumbItem';
import useAuthorizationRequired from '../Authentication/useAuthorizationRequired';

function OrganizationWithIdBreadcrumbs() {
  const match = useRouteMatch();
  const { id } = useParams();
  const { data, loading, error } = useQuery(OrganizationAdminOrganizationsQuery);

  if (loading) {
    return <BreadcrumbItem active><LoadingIndicator /></BreadcrumbItem>;
  }

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  const organization = data.organizations.find((org) => org.id.toString() === id);

  return (
    <>
      <BreadcrumbItem to={`/organizations/${id}`} active={match.isExact}>
        {organization.name}
      </BreadcrumbItem>

      <Route path="/organizations/:id/roles/new">
        <BreadcrumbItem active>
          New organization role
        </BreadcrumbItem>
      </Route>

      <Route path="/organizations/:id/roles/:roleId/edit">
        <BreadcrumbItem active>
          Edit organization role
        </BreadcrumbItem>
      </Route>
    </>
  );
}

function OrganizationAdmin() {
  const authorizationWarning = useAuthorizationRequired('can_read_organizations');
  if (authorizationWarning) return authorizationWarning;

  return (
    <>
      <ol className="breadcrumb">
        <RouteActivatedBreadcrumbItem
          matchProps={{ path: '/organizations', exact: true }}
          to="/organizations"
        >
          Organizations
        </RouteActivatedBreadcrumbItem>

        <Route path="/organizations/:id">
          <OrganizationWithIdBreadcrumbs />
        </Route>
      </ol>

      <Switch>
        <Route path="/organizations/:organizationId/roles/new"><NewOrganizationRole /></Route>
        <Route path="/organizations/:organizationId/roles/:organizationRoleId/edit">
          <EditOrganizationRole />
        </Route>
        <Route path="/organizations/:id"><OrganizationDisplay /></Route>
        <Route path="/organizations"><OrganizationIndex /></Route>
      </Switch>
    </>
  );
}

export default OrganizationAdmin;
