import React, { useState } from 'react';
import Header from '../components/Header';
import AddExpensePopup from '../components/AddExpensePopup';
import './Homepage.css';

const Homepage = () => {
  const [expenses, setExpenses] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

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
    setExpenses((prev) => [
      { ...newExpense, id: prev.length + 1 },
      ...prev,
    ]);
    setShowPopup(false);
    setCurrentPage(1);
  };

  return (
    <div className="homepage">
      <Header />

      <main className="homepage-content">
        <h1 className="expenses-title">Expenses</h1>
        <div className="total-expenses">Rp. {totalExpenses.toLocaleString()}</div>

        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
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
            onClose={() => setShowPopup(false)}
            onAddExpense={handleAddExpense}
          />
        )}
      </main>
    </div>
  );
};

export default Homepage;
