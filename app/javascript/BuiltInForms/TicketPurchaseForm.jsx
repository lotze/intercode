import React from 'react';
import PropTypes from 'prop-types';
import { enableUniqueIds } from 'react-html-id';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Modal from 'react-bootstrap4-modal';
import { Elements } from 'react-stripe-elements';

import ErrorDisplay from '../ErrorDisplay';
import formatMoney from '../formatMoney';
import LazyStripe from '../LazyStripe';
import TicketPurchasePaymentSection from './TicketPurchasePaymentSection';

const purchaseTicketMutation = gql`
mutation PurchaseTicket($input: PurchaseTicketInput!) {
  purchaseTicket(input: $input) {
    ticket {
      id

      ticket_type {
        description
      }

      payment_amount {
        fractional
      }
    }
  }
}
`;

@graphql(purchaseTicketMutation, {
  props: ({ mutate }) => ({
    purchaseTicket: (ticketTypeId, stripeToken) => mutate({
      variables: {
        input: {
          ticket_type_id: ticketTypeId,
          stripe_token: stripeToken,
        },
      },
    }),
  }),
})
class TicketPurchaseForm extends React.Component {
  static propTypes = {
    purchaseTicket: PropTypes.func.isRequired,
    ticketTypes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      formattedPrice: PropTypes.string.isRequired,
      available: PropTypes.bool.isRequired,
    })).isRequired,
    createChargeUrl: PropTypes.string.isRequired,
    purchaseCompleteUrl: PropTypes.string.isRequired,
    ticketTypeId: PropTypes.number,
    initialName: PropTypes.string,
  };

  static defaultProps = {
    ticketTypeId: '',
    initialName: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      paymentError: null,
      submitting: false,
      ticketTypeId: (this.props.ticketTypeId || '').toString(),
      name: props.initialName || '',
    };

    enableUniqueIds(this);
  }

  getTicketType = () => {
    const ticketTypeId = Number.parseInt(this.state.ticketTypeId, 10);

    return this.props.ticketTypes.find(ticketType => ticketType.id === ticketTypeId);
  }

  fieldChanged = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleStripeResponse = async (token) => {
    this.setState({ paymentError: null, submitting: true });
    try {
      const purchaseResponse = await this.props.purchaseTicket(
        Number.parseInt(this.state.ticketTypeId, 10),
        token.id,
      );
      this.setState({
        ticket: purchaseResponse.data.purchaseTicket.ticket,
        submitting: false,
      });
    } catch (error) {
      this.setState({
        graphQLError: error,
        submitting: false,
      });
    }
  }

  purchaseAcknowledged = () => {
    window.location.href = this.props.purchaseCompleteUrl;
  }

  isDisabled = () => ((!this.state.ticketTypeId) || this.state.submitting);

  renderTicketTypeSelect = () => {
    const options = this.props.ticketTypes.map((ticketType) => {
      let description = `${ticketType.name} (${ticketType.formattedPrice})`;
      if (!ticketType.available) {
        description += ' - SOLD OUT';
      }

      let formCheckClass = 'form-check';
      if (!ticketType.available) {
        formCheckClass += ' disabled';
      }

      const radioId = this.nextUniqueId();

      return (
        <div className={formCheckClass} key={ticketType.id}>
          <label className="form-check-label" htmlFor={radioId}>
            <input
              type="radio"
              className="form-check-input"
              value={ticketType.id}
              id={radioId}
              name="ticketTypeId"
              disabled={!ticketType.available}
              checked={this.state.ticketTypeId === ticketType.id.toString()}
              onChange={this.fieldChanged}
            />
            &nbsp;
            {description}
          </label>
        </div>
      );
    });

    return options;
  }

  renderFormGroup = (name, label, type, value) => {
    const inputId = this.nextUniqueId();

    return (
      <div className="form-group">
        <label htmlFor={inputId}>{label}</label>
        <input
          className="form-control"
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={this.fieldChanged}
          disabled={this.isDisabled()}
        />
      </div>
    );
  }

  renderPaymentSection = () => (
    <div>
      <hr />
      <ErrorDisplay
        stringError={this.state.paymentError}
        graphQLError={this.state.graphQLError}
      />

      {this.renderFormGroup('name', 'Name', 'text', this.state.name)}

      <TicketPurchasePaymentSection
        disabled={this.isDisabled()}
        name={this.state.name}
        onError={error => this.setState({ paymentError: error.message })}
        onReceiveToken={this.handleStripeResponse}
        submitting={this.state.submitting}
      />
    </div>
  )

  render = () => (
    <LazyStripe>
      <Elements>
        <React.Fragment>
          {this.renderTicketTypeSelect()}
          {this.renderPaymentSection()}
          <Modal visible={this.state.ticket != null}>
            <div className="modal-header"><h3>Thank you!</h3></div>
            <div className="modal-body">
              {
                this.state.ticket
                  ? (
                    <div>
                    Your purchase of a
                      {' '}
                      {this.state.ticket.ticket_type.description}
                      {' '}
    for
                      {' '}
                      {formatMoney(this.state.ticket.payment_amount)}
                      {' '}
                    was successful.  We&apos;ve emailed you a receipt.
                    </div>
                  )
                  : null
              }
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={this.purchaseAcknowledged}>OK</button>
            </div>
          </Modal>
        </React.Fragment>
      </Elements>
    </LazyStripe>
  );
}

export default TicketPurchaseForm;
