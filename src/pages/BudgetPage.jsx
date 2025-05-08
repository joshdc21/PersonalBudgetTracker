import React, { useState } from 'react';
import Header from '../components/Header';
import AddBudgetPopup from '../components/AddBudgetPopup';
import './BudgetPage.css';

const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(budgets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBudgets = budgets.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddBudget = (newBudget) => {
    if (editingBudget) {
      setBudgets(prev => prev.map(budget => 
        budget.id === editingBudget.id ? { ...newBudget, id: editingBudget.id } : budget
      ));
      setEditingBudget(null);
    } else {
      setBudgets((prev) => [
        { ...newBudget, id: Date.now() },
        ...prev,
      ]);
    }
    setShowPopup(false);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowPopup(true);
  };

  const handleDeleteBudget = (id) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
    if (currentBudgets.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setShowPopup(false);
  };

  return (
    <div className="budget-page">
      <Header />

      <main className="budget-content">
        <h1 className="budget-title">Budget Management</h1>
        <div className="table-container">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Month/Year</th>
                <th>Budget Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBudgets.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    No budgets to show
                  </td>
                </tr>
              ) : (
                currentBudgets.map((budget) => (
                  <tr key={budget.id}>
                    <td>{budget.monthYear}</td>
                    <td>Rp. {budget.amount.toLocaleString('id-ID')}</td>
                    <td className="budget-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditBudget(budget)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteBudget(budget.id)}
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
      </main>

      <button className="add-budget-button" onClick={() => setShowPopup(true)}>
        +
      </button>

      {showPopup && (
        <div className="popup">
          <AddBudgetPopup
            onClose={handleCancelEdit}
            onAddBudget={handleAddBudget}
            budgetToEdit={editingBudget}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetPage;