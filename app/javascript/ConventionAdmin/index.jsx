import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql, compose } from 'react-apollo';
import ConventionForm from '../BuiltInForms/ConventionForm';
import GraphQLQueryResultWrapper from '../GraphQLQueryResultWrapper';
import GraphQLResultPropType from '../GraphQLResultPropType';
import StandaloneGraphQLComponent from '../StandaloneGraphQLComponent';

const conventionFragment = gql`
fragment ConventionAdminConventionFields on Convention {
  accepting_proposals
  starts_at
  ends_at
  name
  domain
  timezone_name
  registrations_frozen
  show_schedule

  maximum_event_signups {
    timespans {
      start
      finish
      value
    }
  }
}
`;

const conventionQuery = gql`
query($id: Int!) {
  convention(id: $id) {
    ...ConventionAdminConventionFields
  }
}

${conventionFragment}
`;

const updateConventionMutation = gql`
mutation($input: UpdateConventionInput!) {
  updateConvention(input: $input) {
    convention {
      ...ConventionAdminConventionFields
    }
  }
}

${conventionFragment}
`;

@StandaloneGraphQLComponent
@compose(
  graphql(conventionQuery),
  graphql(updateConventionMutation, { name: 'updateConvention' }),
)
@GraphQLQueryResultWrapper
class ConventionAdmin extends React.Component {
  static propTypes = {
    data: GraphQLResultPropType(conventionQuery, 'convention').isRequired,
    updateConvention: PropTypes.func.isRequired,
  };

  saveConvention = (convention) => {
    const input = {
      convention: {
        accepting_proposals: convention.accepting_proposals,
        starts_at: convention.starts_at,
        ends_at: convention.ends_at,
        name: convention.name,
        domain: convention.domain,
        timezone_name: convention.timezone_name,
        registrations_frozen: convention.registrations_frozen,
        show_schedule: convention.show_schedule,
        maximum_event_signups: {
          timespans: convention.maximum_event_signups.timespans.map(timespan => ({
            start: timespan.start,
            finish: timespan.finish,
            string_value: timespan.value,
          })),
        },
      },
    };

    this.props.updateConvention({ variables: { input } }).then(() => { window.location.href = '/'; });
  }

  render = () => (
    <div className="mb-4">
      <ConventionForm
        initialConvention={this.props.data.convention}
        saveConvention={this.saveConvention}
      />
    </div>
  )
}

export default ConventionAdmin;
