import React from 'react';
import PropTypes from 'prop-types';
import { humanize, titleize } from 'inflected';
import reverse from 'lodash-es/reverse';
import sortBy from 'lodash-es/sortBy';

import ErrorDisplay from '../ErrorDisplay';
import useQuerySuspended from '../useQuerySuspended';
import { UserAdminQuery } from './queries.gql';

function sortByConventionDate(profiles) {
  return reverse(sortBy(profiles, profile => profile.convention.starts_at));
}

function UserAdminDisplay({ userId }) {
  const { data, error } = useQuerySuspended(UserAdminQuery, { variables: { id: userId } });

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  return (
    <div className="row">
      <div className="col-lg-9">
        <h1>{data.user.name}</h1>
        <table className="table table-sm table-striped my-4">
          <tbody>
            {['first_name', 'last_name', 'email'].map(field => (
              <tr key={field}>
                <th scope="row" className="pr-2">{humanize(field)}</th>
                <td className="col-md-9">
                  {data.user[field]}
                </td>
              </tr>
            ))}

            <tr>
              <th scope="row" className="pr-2">Privileges</th>
              <td>
                {data.user.privileges.length > 0
                  ? data.user.privileges.map(priv => titleize(priv)).join(', ')
                  : 'none'}
              </td>
            </tr>

            <tr>
              <th scope="row" className="pr-2">Convention profiles</th>
              <td>
                {data.user.user_con_profiles.length > 0
                  ? (
                    <ul className="list-unstyled mb-0">
                      {sortByConventionDate(data.user.user_con_profiles).map(profile => (
                        <li key={profile.id}>
                          <a href={`//${profile.convention.domain}`}>
                            {profile.convention.name}
                          </a>
                          {profile.privileges.length > 0
                            ? ` (${profile.privileges.map(priv => titleize(priv)).join(', ')})`
                            : null
                          }
                        </li>
                      ))}
                    </ul>
                  )
                  : 'none'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="col-lg-3">
        {/* this.renderUserAdminSection(data) */}
      </div>
    </div>
  );
}

UserAdminDisplay.propTypes = {
  userId: PropTypes.number.isRequired,
};

export default UserAdminDisplay;
