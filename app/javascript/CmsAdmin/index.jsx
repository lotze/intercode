import React from 'react';
import PropTypes from 'prop-types';
import {
  NavLink, Switch, Route, Redirect,
} from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import CmsVariablesAdmin from './CmsVariablesAdmin';
import CmsGraphqlQueriesAdmin from './CmsGraphqlQueriesAdmin';
import { CmsAdminBaseQuery } from './queries.gql';
import NavigationItemsAdmin from './NavigationItemsAdmin';
import ErrorDisplay from '../ErrorDisplay';
import CmsContentGroupsAdmin from './CmsContentGroupsAdmin';
import CmsPagesAdmin from './CmsPagesAdmin';
import CmsLayoutsAdmin from './CmsLayoutsAdmin';
import CmsPartialsAdmin from './CmsPartialsAdmin';
import CmsFilesAdmin from './CmsFilesAdmin';
import RootSiteAdmin from '../RootSiteAdmin';
import LoadingIndicator from '../LoadingIndicator';
import useAuthorizationRequired from '../Authentication/useAuthorizationRequired';
import MenuIcon from '../NavigationBar/MenuIcon';

function CmsAdminNavTab({ path, children, icon }) {
  return (
    <li className="nav-item">
      <NavLink to={path} className="nav-link" role="presentation">
        {icon && <MenuIcon icon={icon} />}
        {children}
      </NavLink>
    </li>
  );
}

CmsAdminNavTab.propTypes = {
  path: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
};

CmsAdminNavTab.defaultProps = {
  icon: null,
};

function CmsAdmin() {
  const authorizationWarning = useAuthorizationRequired('can_manage_any_cms_content');
  const { data, loading, error } = useQuery(CmsAdminBaseQuery);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  if (authorizationWarning) return authorizationWarning;

  return (
    <>
      <h1>CMS</h1>

      <ul className="nav nav-tabs" role="tablist">
        <CmsAdminNavTab path="/cms_pages" icon="fa-file-text-o">Pages</CmsAdminNavTab>
        <CmsAdminNavTab path="/cms_partials" icon="fa-paperclip">Partials</CmsAdminNavTab>
        <CmsAdminNavTab path="/cms_files" icon="fa-file-image-o">Files</CmsAdminNavTab>
        {data.currentAbility.can_create_cms_navigation_items
          && <CmsAdminNavTab path="/cms_navigation_items" icon="fa-map-o">Navigation</CmsAdminNavTab>}
        <CmsAdminNavTab path="/cms_layouts" icon="fa-columns">Layouts</CmsAdminNavTab>
        <CmsAdminNavTab path="/cms_variables" icon="fa-list">Variables</CmsAdminNavTab>
        <CmsAdminNavTab path="/cms_graphql_queries" icon="fa-code">GraphQL queries</CmsAdminNavTab>
        <CmsAdminNavTab path="/cms_content_groups" icon="fa-group">Content groups</CmsAdminNavTab>
        {
          !data.convention && (
            <CmsAdminNavTab path="/root_site" icon="fa-cogs">Root site settings</CmsAdminNavTab>
          )
        }
      </ul>

      <br />

      <Switch>
        <Route path="/cms_pages"><CmsPagesAdmin /></Route>
        <Route path="/cms_partials"><CmsPartialsAdmin /></Route>
        <Route path="/cms_files"><CmsFilesAdmin /></Route>
        {data.currentAbility.can_create_cms_navigation_items
          ? <Route path="/cms_navigation_items"><NavigationItemsAdmin /></Route>
          : <Route path="/cms_navigation_items"><Redirect to="/cms_pages" /></Route>}
        <Route path="/cms_layouts"><CmsLayoutsAdmin /></Route>
        <Route path="/cms_variables"><CmsVariablesAdmin /></Route>
        <Route path="/cms_graphql_queries"><CmsGraphqlQueriesAdmin /></Route>
        <Route path="/cms_content_groups"><CmsContentGroupsAdmin /></Route>
        <Route path="/root_site"><RootSiteAdmin /></Route>
      </Switch>
    </>
  );
}

export default CmsAdmin;
