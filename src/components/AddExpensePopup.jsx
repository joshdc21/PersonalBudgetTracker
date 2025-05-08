import React, { useState, useEffect } from 'react';
import WarningDialog from './WarningDialog'; 
import './AddExpensePopup.css';

const defaultCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

const AddExpensePopup = ({ 
  onClose, 
  onAddExpense, 
  expenseToEdit, 
  onDeleteExpensesByCategory,
  selectedMonth, 
  selectedYear    
}) => {
  const [categories, setCategories] = useState([...defaultCategories]);
  const [category, setCategory] = useState(defaultCategories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('expenseCategories');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCategories([...new Set([...defaultCategories, ...parsed])]);
    }
  }, []);

  useEffect(() => {
    if (expenseToEdit) {
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);

      const expenseDate = new Date(expenseToEdit.date);
      setDate(formatDateForInput(expenseDate));
    } else {
      const defaultDate = new Date();
      if (selectedYear && selectedMonth) {
        defaultDate.setFullYear(selectedYear);
        defaultDate.setMonth(selectedMonth - 1);
        defaultDate.setDate(1); 
      }
      setDate(formatDateForInput(defaultDate));
    }
  }, [expenseToEdit, selectedMonth, selectedYear]);

  const formatDateForInput = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const getDateConstraints = () => {
    if (selectedYear && selectedMonth) {
      const year = selectedYear;
      const month = selectedMonth;
      
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      return {
        min: formatDateForInput(firstDay),
        max: formatDateForInput(lastDay)
      };
    }
    return {};
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    setShowCustomInput(selected === 'Other');
    if (selected !== 'Other') setCustomCategory('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9,]/g, '');
    if ((value.match(/,/g) || []).length > 1) return;
    setAmount(value);
  };

  const formatAmount = (value) =>
    value ? `Rp. ${value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    const finalCategory = category === 'Other' && customCategory ? customCategory : category;

    const newExpense = {
      id: expenseToEdit ? expenseToEdit.id : Date.now(),
      category: finalCategory,
      amount: parseInt(amount.replace(/\D/g, '')),
      description,
      date: new Date(date),
    };

    if (category === 'Other' && customCategory && !categories.includes(customCategory)) {
      const updated = [...categories];
      updated.splice(updated.length - 1, 0, customCategory);
      setCategories(updated);
      const custom = updated.filter(c => !defaultCategories.includes(c));
      localStorage.setItem('expenseCategories', JSON.stringify(custom));
    }

    onAddExpense(newExpense);
    onClose();
  };

  const promptRemoveCategory = (cat) => {
    if (!defaultCategories.includes(cat)) setCategoryToRemove(cat);
  };

  const handleRemoveCategory = () => {
    const updated = categories.filter(c => c !== categoryToRemove);
    setCategories(updated);
    localStorage.setItem('expenseCategories', JSON.stringify(updated.filter(c => !defaultCategories.includes(c))));
    onDeleteExpensesByCategory(categoryToRemove);
    if (category === categoryToRemove) setCategory(defaultCategories[0]);
    setCategoryToRemove(null);
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="form-control"
              {...getDateConstraints()}
              required
            />
          </div>

          <div className="form-group">
            <select value={category} onChange={handleCategoryChange} className="form-control" required>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {showCustomInput && (
            <div className="form-group">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                className="form-control"
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              value={formatAmount(amount)}
              onChange={handleAmountChange}
              placeholder="Rp. xxx.xxx"
              inputMode="numeric"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="form-control"
            />
          </div>

          {categories.some(c => !defaultCategories.includes(c)) && (
            <div className="custom-categories-section">
              <label>Custom Categories</label>
              <div className="category-tags">
                {categories
                  .filter(c => !defaultCategories.includes(c))
                  .map(c => (
                    <span key={c} className="category-tag">
                      {c}
                      <button
                        type="button"
                        className="remove-category-btn"
                        onClick={() => promptRemoveCategory(c)}
                        title="Remove category"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {expenseToEdit ? 'Save Changes' : 'Add'}
          </button>
        </form>

        {categoryToRemove && (
          <WarningDialog
            message={`Are you sure you want to remove "${categoryToRemove}"?\nAll expenses in this category will be deleted.`}
            onConfirm={handleRemoveCategory}
            onCancel={() => setCategoryToRemove(null)}
            confirmText="Delete"
          />
        )}
      </div>
    </div>
  );
};

export default AddExpensePopup;