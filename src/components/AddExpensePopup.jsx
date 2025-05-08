import React, { useState } from 'react';
import './AddExpensePopup.css';

const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

const AddExpensePopup = ({ onClose, onAddExpense }) => {
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !description) return;

    const newExpense = {
      id: Date.now(),
      category,
      amount: parseInt(amount), 
      description,
      date: new Date(),
    };

    onAddExpense(newExpense);
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

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h3>Add Expense</h3>
        <form onSubmit={handleSubmit}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            value={formatAmount(amount)}
            onChange={handleAmountChange}
            placeholder="Rp. xxx.xxx"
            inputMode="numeric"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
};

export default AddExpensePopup;
