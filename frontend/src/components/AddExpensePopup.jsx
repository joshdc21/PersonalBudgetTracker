import React, { useState } from 'react';
import './AddExpensePopup.css';

const categories = ['Food', 'Transport', 'Entertainment', 'Other'];

const AddExpensePopup = ({ onClose, onSaveExpense, expenseToEdit }) => {
  const [category, setCategory] = useState(expenseToEdit ? expenseToEdit.category : categories[0]);
  const [amount, setAmount] = useState(expenseToEdit ? expenseToEdit.amount.toString() : '');
  const [description, setDescription] = useState(expenseToEdit ? expenseToEdit.description : '');
  
  // Format date to YYYY-MM-DD for input element
  const getInitialDate = () => {
    if (expenseToEdit && expenseToEdit.date) {
      return new Date(expenseToEdit.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };
  const [date, setDate] = useState(getInitialDate());

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !description || !date) return;

    const savedExpense = {
      category,
      amount: parseInt(amount), // Ensure amount is a number
      description,
      date: new Date(date), // Use selected date
    };

    if (expenseToEdit) {
      savedExpense._id = expenseToEdit._id;
    }

    onSaveExpense(savedExpense);
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
        <h3>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
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

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          />

          <button type="submit">{expenseToEdit ? 'Save' : 'Add'}</button>
        </form>
      </div>
    </div>
  );
};

export default AddExpensePopup;
