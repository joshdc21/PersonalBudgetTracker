import React, { useState } from 'react';
import './AddExpensePopup.css';

const AddBudgetPopup = ({ onClose, onAddBudget }) => {
  const [monthYear, setMonthYear] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!monthYear || !amount) return;

    const [month, year] = monthYear.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 4) {
      alert('Please enter a valid MM/YYYY format');
      return;
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      alert('Month must be between 01 and 12');
      return;
    }

    if (yearNum < 2000 || yearNum > 2099) {
      alert('Year must be between 2000 and 2099');
      return;
    }

    const newBudget = {
      id: Date.now(),
      monthYear,
      amount: parseInt(amount),
    };

    onAddBudget(newBudget);
    onClose();
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmount(value);
  };

  const formatAmount = (value) => {
    if (!value) return '';
    return `Rp. ${value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  const handleMonthYearChange = (e) => {
    const value = e.target.value.replace(/[^0-9/]/g, '');

    if (value.length === 2 && !value.includes('/')) {
      setMonthYear(value + '/');
    } 
    else if (value.length <= 7) {
      setMonthYear(value);
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>Add Budget</h3>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            value={monthYear}
            onChange={handleMonthYearChange}
            placeholder="MM/YYYY"
            maxLength={7}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            className="form-control"
            value={formatAmount(amount)}
            onChange={handleAmountChange}
            placeholder="Rp. xxx.xxx"
            inputMode="numeric"
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add</button>
      </form>
      </div>
    </div>
  );
};

export default AddBudgetPopup;