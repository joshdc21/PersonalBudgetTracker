import React, { useState } from 'react';
import Header from '../components/Header';
import AddExpensePopup from '../components/AddExpensePopup';
import WarningDialog from '../components/WarningDialog';
import './Homepage.css';

const Homepage = () => {
  const [expenses, setExpenses] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState(500000);  

  const itemsPerPage = 10;
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddExpense = (newExpense) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(exp => 
        exp.id === editingExpense.id ? { ...newExpense, id: editingExpense.id } : exp
      ));
      setEditingExpense(null);
    } else {
      setExpenses((prev) => [
        { ...newExpense, id: Date.now() },
        ...prev,
      ]);
    }
    setShowPopup(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowPopup(true);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    if (currentExpenses.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setShowPopup(false);
  };

  const handleDeleteExpensesByCategory = (categoryName) => {
    setExpenses(prev => prev.filter(exp => exp.category !== categoryName));
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      handleDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };
  
  const cancelDeleteExpense = () => {
    setExpenseToDelete(null);
  };

  return (
    <div className="homepage">
      <Header />

      <main className="homepage-content">
      <div className="expenses-header">
        <div className="expenses-section">
          <h1 className="expenses-title">Expenses</h1>
          <div className="total-expenses">Rp. {totalExpenses.toLocaleString()}</div>
        </div>

        <div className="budget-section">
          <h1 className="expenses-title">Budget</h1>
          <div className="total-expenses">Rp. {budgetAmount.toLocaleString()}</div>
        </div>
      </div>
        
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No expenses to show
                  </td>
                </tr>
              ) : (
                currentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.category}</td>
                    <td>{new Date(expense.date).toLocaleDateString('en-US')}</td>
                    <td className="expense-amount">-Rp. {expense.amount.toLocaleString()}</td>
                    <td>{expense.description}</td>
                    <td className="expense-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditExpense(expense)}
                      >
                        Edit
                      </button>
                      <button 
                      className="delete-btn" 
                      onClick={() => setExpenseToDelete(expense)}
                    >
                      Delete
                    </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>« Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next »</button>
        </div>

        <button className="add-button" onClick={() => setShowPopup(true)}>
          +
        </button>

        {showPopup && (
          <AddExpensePopup
            onClose={handleCancelEdit}
            onAddExpense={handleAddExpense}
            expenseToEdit={editingExpense}
            expenses={expenses}
            onDeleteExpensesByCategory={handleDeleteExpensesByCategory}
          />
        )}

      {expenseToDelete && (
        <WarningDialog
          message={`Are you sure you want to delete this expense in "${expenseToDelete.category}"?`}
          subMessage={`Amount: Rp. ${expenseToDelete.amount.toLocaleString()}`}
          onConfirm={confirmDeleteExpense}
          onCancel={cancelDeleteExpense}
          confirmText="Delete"
        />
      )}
      </main>
    </div>
  );
};

export default Homepage;
