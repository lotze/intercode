import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { ConfirmModal } from 'react-bootstrap4-modal';

import useModal from './useModal';

const ConfirmContext = React.createContext(() => {});

function Confirm({ children }) {
  const [actionInProgress, setActionInProgress] = useState(false);
  const modal = useModal();

  const okClicked = async () => {
    setActionInProgress(true);
    try {
      await modal.state.action();
      modal.close();
    } catch (error) {
      if (modal.state.onError) {
        modal.state.onError(error);
      }

      if (modal.state.renderError) {
        modal.setState({ ...modal.state, error });
      }

      if (!modal.state.onError && !modal.state.renderError) {
        throw error;
      }
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <ConfirmContext.Provider value={modal.open}>
      {children}
      <ConfirmModal
        visible={modal.visible}
        onOK={okClicked}
        onCancel={modal.close}
        disableButtons={actionInProgress}
      >
        {(modal.state || {}).prompt || <div />}
        {
          (modal.state && modal.state.renderError && modal.state.error)
            ? modal.state.renderError(modal.state.error)
            : null
        }
      </ConfirmModal>
    </ConfirmContext.Provider>
  );
}

Confirm.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  return confirm;
}

Confirm.Trigger = ({ children }) => {
  const confirm = useConfirm();
  return children(confirm);
};

Confirm.Trigger.propTypes = {
  children: PropTypes.func.isRequired,
};

export default Confirm;
