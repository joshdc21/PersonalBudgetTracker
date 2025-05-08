import React, { useState, useEffect } from 'react';
import './AddExpensePopup.css';

const defaultCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

const AddExpensePopup = ({ onClose, onAddExpense, expenseToEdit, expenses, onDeleteExpensesByCategory }) => {
  const [categories, setCategories] = useState([...defaultCategories]);
  const [category, setCategory] = useState(defaultCategories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState(null);

  useEffect(() => {
    const savedCategories = localStorage.getItem('expenseCategories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      const mergedCategories = [...new Set([...defaultCategories, ...parsedCategories])];
      setCategories(mergedCategories);
    }
  }, []);

  useEffect(() => {
    if (expenseToEdit) {
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
    }
  }, [expenseToEdit]);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setShowCustomInput(selectedCategory === 'Other');
    if (selectedCategory !== 'Other') {
      setCustomCategory('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const finalCategory = category === 'Other' && customCategory ? customCategory : category;

    const newExpense = {
      id: expenseToEdit ? expenseToEdit.id : Date.now(),
      category: finalCategory,
      amount: parseInt(amount),
      description,
      date: expenseToEdit ? expenseToEdit.date : new Date(),
    };

    if (category === 'Other' && customCategory && !categories.includes(customCategory)) {
      const updatedCategories = [...categories];
      updatedCategories.splice(updatedCategories.length - 1, 0, customCategory);
      setCategories(updatedCategories);
      const customCategories = updatedCategories.filter(cat => !defaultCategories.includes(cat));
      localStorage.setItem('expenseCategories', JSON.stringify(customCategories));
    }

    onAddExpense(newExpense);
    onClose();
  };

  const promptRemoveCategory = (catToRemove) => {
    if (defaultCategories.includes(catToRemove)) return;
    setCategoryToRemove(catToRemove);
    setShowConfirmDialog(true);
  };

  const handleRemoveCategory = () => {
    const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updatedCategories);

    const customCategories = updatedCategories.filter(cat => !defaultCategories.includes(cat));
    localStorage.setItem('expenseCategories', JSON.stringify(customCategories));

    onDeleteExpensesByCategory(categoryToRemove);

    if (category === categoryToRemove) {
      setCategory(defaultCategories[0]);
    }

    setShowConfirmDialog(false);
    setCategoryToRemove(null);
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
    setCategoryToRemove(null);
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
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select 
              value={category} 
              onChange={handleCategoryChange} 
              required
              className="form-control"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              required
              className="form-control"
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

          {categories.filter(cat => !defaultCategories.includes(cat)).length > 0 && (
            <div className="custom-categories-section">
              <label>Custom Categories</label>
              <div className="category-tags">
                {categories.filter(cat => !defaultCategories.includes(cat)).map(cat => (
                  <span key={cat} className="category-tag">
                    {cat}
                    <button 
                      type="button" 
                      onClick={() => promptRemoveCategory(cat)}
                      className="remove-category-btn"
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

        {showConfirmDialog && (
          <div className="confirmation-dialog">
            <div className="dialog-content">
              <p>Are you sure you want to remove "{categoryToRemove}"?</p>
              <p>All expenses in this category will be deleted.</p>
              <div className="dialog-buttons">
                <button onClick={handleCancelRemove} className="cancel-btn">Cancel</button>
                <button onClick={handleRemoveCategory} className="confirm-btn">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpensePopup;
