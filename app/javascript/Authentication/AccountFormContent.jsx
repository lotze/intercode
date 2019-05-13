import React from 'react';
import { useQuery } from 'react-apollo-hooks';

import { AccountFormContentQuery } from './queries.gql';
import parsePageContent from '../parsePageContent';

function AccountFormContent() {
  const { data, loading, error } = useQuery(AccountFormContentQuery);

  if (error || loading) {
    return <></>;
  }

  return parsePageContent(data.accountFormContentHtml).bodyComponents;
}

export default AccountFormContent;