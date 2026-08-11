import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AddBudgetPopup from '../components/AddBudgetPopup';
import './BudgetPage.css';

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

const BudgetPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch comparison stats for selected month and year
  const fetchBudgetStats = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/analytics/expenses?year=${selectedYear}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch budget analysis.');
      }

      setStats(data.data);
    } catch (err) {
      setError(err.message || 'Error loading budget data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStats();
  }, [selectedMonth, selectedYear]);

  const handleAddBudget = async (newBudget) => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    setError('');

    // Parse MM/YYYY format
    const [monthStr, yearStr] = newBudget.monthYear.split('/');
    const m = parseInt(monthStr);
    const y = parseInt(yearStr);

    try {
      const response = await fetch(`${API_URL}/budgets/${y}/${m}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: newBudget.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update budget.');
      }

      // If updated budget is for currently selected view, reload stats
      if (m === selectedMonth && y === selectedYear) {
        fetchBudgetStats();
      } else {
        // Switch view to the updated month/year
        setSelectedMonth(m);
        setSelectedYear(y);
      }

      setShowPopup(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Dashboard calculation helper
  const budget = stats ? stats.budget : 0;
  const spent = stats ? stats.spent : 0;
  const remaining = stats ? stats.remaining : 0;
  const percentageUsed = stats ? stats.percentageUsed : 0;

  // Determine progress bar colors
  let progressClass = 'normal';
  if (percentageUsed >= 100) {
    progressClass = 'danger';
  } else if (percentageUsed >= 85) {
    progressClass = 'warning';
  }

  return (
    <div className="budget-page">
      <Header />

      <main className="budget-content">
        <h1 className="budget-title">Budget Comparison</h1>

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
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {isLoading && <div style={{ fontSize: '1.2rem', marginTop: '2rem' }}>Loading comparison statistics...</div>}

        {!isLoading && stats && (
          <div className="budget-dashboard">
            <div className="dashboard-grid">
              <div className="dashboard-item">
                <label>Monthly Budget Limit</label>
                <span>Rp. {budget.toLocaleString('id-ID')}</span>
              </div>
              <div className="dashboard-item">
                <label>Actual Spent</label>
                <span>Rp. {spent.toLocaleString('id-ID')}</span>
              </div>
              <div className={`dashboard-item ${remaining >= 0 ? 'remaining-positive' : 'remaining-negative'}`}>
                <label>{remaining >= 0 ? 'Remaining Balance' : 'Overdraft Amount'}</label>
                <span>Rp. {Math.abs(remaining).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-label">
                <span>Budget Utilized</span>
                <span>{percentageUsed.toFixed(1)}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${progressClass}`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            {spent > budget && (
              <div className="overspent-alert">
                <span>
                  You have exceeded your budget limit by Rp. {(spent - budget).toLocaleString('id-ID')}.
                </span>
              </div>
            )}

            {budget === 0 && (
              <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>
                No budget has been set for this month. Click the "+" button below to set one.
              </div>
            )}
          </div>
        )}
      </main>

      <button className="add-budget-button" onClick={() => setShowPopup(true)}>
        +
      </button>

      {showPopup && (
        <div className="popup">
          <AddBudgetPopup
            onClose={() => setShowPopup(false)}
            onAddBudget={handleAddBudget}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetPage;