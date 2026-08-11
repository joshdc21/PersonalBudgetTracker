import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AddExpensePopup from '../components/AddExpensePopup';
import './HomePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const months = [
  { val: 1, label: 'January' },
  { val: 2, label: 'February' },
  { val: 3, label: 'March' },
  { val: 4, label: 'April' },
  { val: 5, label: 'May' },
  { val: 6, label: 'June' },
  { val: 7, label: 'July' },
  { val: 8, label: 'August' },
  { val: 9, label: 'September' },
  { val: 10, label: 'October' },
  { val: 11, label: 'November' },
  { val: 12, label: 'December' },
];

const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

const Homepage = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const itemsPerPage = 5;

  // Fetch expenses from API based on filters
  const fetchExpenses = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      let queryStr = `year=${selectedYear}&month=${selectedMonth}`;
      if (selectedCategory !== 'All') {
        queryStr += `&category=${selectedCategory}`;
      }

      const response = await fetch(`${API_URL}/expenses?${queryStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch expenses.');
      }

      setExpenses(data.data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Error loading data. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear, selectedCategory]);

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    } else if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    } else if (sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else {
      return new Date(b.date) - new Date(a.date);
    }
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = sortedExpenses.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSaveExpense = async (savedExpense) => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (savedExpense._id) {
        // Edit mode
        response = await fetch(`${API_URL}/expenses/${savedExpense._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(savedExpense),
        });
      } else {
        // Add mode
        response = await fetch(`${API_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(savedExpense),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save expense.');
      }

      fetchExpenses(); // Reload expenses
      setShowPopup(false);
      setExpenseToEdit(null);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    const token = localStorage.getItem('token');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete expense.');
      }

      fetchExpenses(); // Reload expenses
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleEditClick = (expense) => {
    setExpenseToEdit(expense);
    setShowPopup(true);
  };

  return (
    <div className="homepage">
      <Header />

      <main className="homepage-content">
        <h1 className="expenses-title">Expenses</h1>
        <div className="total-expenses">Rp. {totalExpenses.toLocaleString('id-ID')}</div>

        {/* Filter Controls */}
        <div className="filter-container">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="filter-select"
          >
            {months.map(m => (
              <option key={m.val} value={m.val}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-asc">Amount: Smallest to Largest</option>
            <option value="amount-desc">Amount: Largest to Smallest</option>
          </select>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-container">
          {isLoading && <div className="loading-text">Loading expenses...</div>}
          {!isLoading && (
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Expenses</th>
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
                    <tr key={expense._id}>
                      <td>{expense.category}</td>
                      <td>{new Date(expense.date).toLocaleDateString('en-US')}</td>
                      <td className="expense-amount">-Rp. {expense.amount.toLocaleString('id-ID')}</td>
                      <td>{expense.description}</td>
                      <td>
                        <button onClick={() => handleEditClick(expense)} className="action-btn edit-btn">Edit</button>
                        <button onClick={() => handleDeleteExpense(expense._id)} className="action-btn delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
          <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}>Next »</button>
        </div>

        <button className="add-button" onClick={() => { setExpenseToEdit(null); setShowPopup(true); }}>
          +
        </button>

        {showPopup && (
          <AddExpensePopup
            onClose={() => { setShowPopup(false); setExpenseToEdit(null); }}
            onSaveExpense={handleSaveExpense}
            expenseToEdit={expenseToEdit}
          />
        )}
      </main>
    </div>
  );
};

export default Homepage;
