import React from 'react';
import './WarningDialog.css';

const WarningDialog = ({ message, subMessage, onCancel, onConfirm, confirmText = "Delete" }) => {
  return (
    <div className="confirmation-dialog">
      <div className="dialog-content">
        <p>{message}</p>
        {subMessage && <p>{subMessage}</p>}
        <div className="dialog-buttons">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={onConfirm} className="confirm-btn">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default WarningDialog;
