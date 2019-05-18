import React, { lazy, Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';
import { parse } from 'graphql/language/parser';
import { useApolloClient } from 'react-apollo-hooks';

import BootstrapFormInput from '../../BuiltInFormControls/BootstrapFormInput';
import BootstrapFormTextarea from '../../BuiltInFormControls/BootstrapFormTextarea';
import { mutator, Transforms } from '../../ComposableFormUtils';
import LoadingIndicator from '../../LoadingIndicator';

const GraphiQL = lazy(() => import(/* webpackChunkName: 'graphiql' */ 'graphiql'));

function CmsGraphqlQueryForm({ value, onChange }) {
  const client = useApolloClient();
  const valueMutator = mutator({
    getState: () => value,
    setState: onChange,
    transforms: {
      identifier: Transforms.identity,
      admin_notes: Transforms.identity,
      query: Transforms.identity,
    },
  });
  const fetcher = useMemo(
    () => ({ query, ...otherParams }) => client.query({
      query: parse(query),
      ...otherParams,
    }),
    [client],
  );

  return (
    <>
      <BootstrapFormInput
        name="identifier"
        label="Identifier"
        className="form-control text-monospace"
        value={value.identifier}
        onTextChange={valueMutator.identifier}
      />

      <BootstrapFormTextarea
        name="admin_notes"
        label="Admin notes"
        value={value.admin_notes}
        onTextChange={valueMutator.admin_notes}
      />

      <div className="border" style={{ height: '40em' }}>
        <Suspense fallback={<LoadingIndicator />}>
          <GraphiQL
            query={value.query}
            onEditQuery={valueMutator.query}
            fetcher={fetcher}
          />
        </Suspense>
      </div>
    </>
  );
}

CmsGraphqlQueryForm.propTypes = {
  value: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    admin_notes: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CmsGraphqlQueryForm;
