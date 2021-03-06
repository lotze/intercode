import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';

import { deserializeForm, deserializeFormResponseModel } from '../FormPresenter/GraphQLFormDeserialization';
import ErrorDisplay from '../ErrorDisplay';
import { EventProposalQuery } from './queries.gql';
import FormPresenterApp from '../FormPresenter';
import FormPresenter from '../FormPresenter/Layouts/FormPresenter';
import { UpdateEventProposal, SubmitEventProposal } from './mutations.gql';
import useAsyncFunction from '../useAsyncFunction';
import useAutocommitFormResponseOnChange from '../FormPresenter/useAutocommitFormResponseOnChange';
import PageLoadingIndicator from '../PageLoadingIndicator';

function parseResponseErrors(error) {
  const { graphQLErrors } = error;
  if (!graphQLErrors) {
    return {};
  }
  const updateError = graphQLErrors.find((graphQLError) => isEqual(graphQLError.path, ['updateEventProposal']));
  const { validationErrors } = ((updateError || {}).extensions || {});
  return validationErrors;
}

function ExitButton({ exitButton }) {
  if (!exitButton) {
    return null;
  }

  if (exitButton.caption && exitButton.url) {
    return (
      <Link className="btn btn-outline-secondary mr-2" to={exitButton.url}>
        {exitButton.caption}
      </Link>
    );
  }

  return exitButton;
}

ExitButton.propTypes = {
  exitButton: PropTypes.shape({
    url: PropTypes.string,
    caption: PropTypes.string,
  }),
};

ExitButton.defaultProps = {
  exitButton: null,
};

function EventProposalFormInner({
  convention, initialEventProposal, form, afterSubmit, exitButton,
}) {
  const [updateMutate] = useMutation(UpdateEventProposal);
  const [updateEventProposal, updateError, updateInProgress] = useAsyncFunction(updateMutate);
  const [updatePromise, setUpdatePromise] = useState(null);
  const [submitMutate] = useMutation(SubmitEventProposal);
  const [submitEventProposal, submitError, submitInProgress] = useAsyncFunction(submitMutate);
  const [eventProposal, setEventProposal] = useState(initialEventProposal);
  const [responseErrors, setResponseErrors] = useState({});

  const responseValuesChanged = useCallback(
    (newResponseValues) => {
      setEventProposal((prevEventProposal) => ({
        ...prevEventProposal,
        formResponseAttrs: {
          ...prevEventProposal.formResponseAttrs,
          ...newResponseValues,
        },
      }));
    },
    [],
  );

  const commitResponse = useCallback(
    async (proposal) => {
      try {
        setResponseErrors({});
        const promise = updateEventProposal({
          variables: {
            input: {
              id: proposal.id,
              event_proposal: {
                form_response_attrs_json: JSON.stringify(proposal.formResponseAttrs),
              },
            },
          },
        });
        setUpdatePromise(promise);
        await promise;
      } catch (e) {
        setResponseErrors(parseResponseErrors(e));
      } finally {
        setUpdatePromise(null);
      }
    },
    [updateEventProposal],
  );
  useAutocommitFormResponseOnChange(commitResponse, eventProposal);

  const submitResponse = useCallback(
    (proposal) => submitEventProposal({
      variables: {
        input: {
          id: proposal.id,
        },
      },
    }),
    [submitEventProposal],
  );

  const formSubmitted = useCallback(
    () => {
      if (afterSubmit) {
        afterSubmit();
      }
    },
    [afterSubmit],
  );

  const submitForm = useCallback(
    async () => {
      if (updatePromise) {
        updatePromise.then(() => { submitForm(); });
        return;
      }

      try {
        await submitResponse(eventProposal);
        formSubmitted();
      } catch (e) {
        setResponseErrors(parseResponseErrors(e));
      }
    },
    [eventProposal, formSubmitted, submitResponse, updatePromise],
  );

  return (
    <FormPresenterApp form={form}>
      <div>
        <FormPresenter
          form={form}
          convention={convention}
          response={eventProposal.formResponseAttrs}
          responseErrors={responseErrors}
          isSubmittingResponse={submitInProgress}
          isUpdatingResponse={updateInProgress}
          responseValuesChanged={responseValuesChanged}
          submitForm={submitForm}
          exitButton={exitButton}
          submitButton={{ caption: 'Submit proposal' }}
          footerContent={(
            <div className="text-right">
              <small className="text-muted">Your responses are automatically saved.</small>
            </div>
          )}
        />
        <ErrorDisplay graphQLError={updateError || submitError} />
      </div>
    </FormPresenterApp>
  );
}

EventProposalFormInner.propTypes = {
  convention: PropTypes.shape({}).isRequired,
  initialEventProposal: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({}).isRequired,
  afterSubmit: PropTypes.func,
  exitButton: PropTypes.node,
};

EventProposalFormInner.defaultProps = {
  afterSubmit: null,
  exitButton: null,
};

function EventProposalForm({ eventProposalId, afterSubmit, exitButton }) {
  const { data, loading, error } = useQuery(EventProposalQuery, { variables: { eventProposalId } });

  const initialEventProposal = useMemo(
    () => (loading || error ? null : deserializeFormResponseModel(data.eventProposal)),
    [loading, error, data],
  );

  const form = useMemo(
    () => (loading || error
      ? null
      : deserializeForm(data.eventProposal.event_category.event_proposal_form)),
    [loading, error, data],
  );

  if (loading) {
    return <PageLoadingIndicator visible />;
  }

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  return (
    <EventProposalFormInner
      convention={data.convention}
      initialEventProposal={initialEventProposal}
      form={form}
      afterSubmit={afterSubmit}
      exitButton={exitButton}
    />
  );
}

EventProposalForm.propTypes = {
  eventProposalId: PropTypes.number.isRequired,
  afterSubmit: PropTypes.func,
  exitButton: PropTypes.shape({}),
};

EventProposalForm.defaultProps = {
  afterSubmit: null,
  exitButton: null,
};

export default EventProposalForm;
