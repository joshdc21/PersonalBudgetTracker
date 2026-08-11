import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './ChartPage.css';

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

const ChartPage = () => {
  const defaultColors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'];
  const [categoryColors, setCategoryColors] = useState({});

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
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
        throw new Error(data.message || 'Failed to fetch analytics.');
      }

      setStats(data.data);
    } catch (err) {
      setError(err.message || 'Error loading analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const handleColorChange = (category, color) => {
    setCategoryColors((prev) => ({
      ...prev,
      [category]: color,
    }));
  };

  // Process data for charts & tables
  const totalAmount = stats ? stats.totalExpenses : 0;
  const categoriesList = stats ? stats.byCategory : [];

  // Filter categories with positive amounts for the Pie Chart
  const activeCategories = categoriesList.filter(item => item.amount > 0);

  const dataForChart = activeCategories.map(({ category, amount }, index) => ({
    name: category,
    value: amount,
    color: categoryColors[category] || defaultColors[index % defaultColors.length],
  }));

  return (
    <div className="chart-page">
      <Header />
      <main className="chart-content">
        <h1>Expense Analytics</h1>

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

        {isLoading && <div style={{ fontSize: '1.2rem', marginTop: '2rem' }}>Loading analytics...</div>}

        {!isLoading && stats && (
          <>
            {totalAmount === 0 ? (
              <div className="empty-state">
                No expenses recorded for {months.find(m => m.val === selectedMonth)?.label} {selectedYear}.
              </div>
            ) : (
              <div className="chart-dashboard-grid">
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dataForChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {dataForChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-center-label">
                    Rp. {totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="category-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Percentage</th>
                        <th>Amount</th>
                        <th>Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesList.map(({ category, percentage, amount }, index) => (
                        <tr key={category}>
                          <td>{category}</td>
                          <td>{percentage.toFixed(1)}%</td>
                          <td>-Rp. {amount.toLocaleString('id-ID')}</td>
                          <td>
                            <input
                              type="color"
                              value={categoryColors[category] || defaultColors[index % defaultColors.length]}
                              onChange={(e) => handleColorChange(category, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ChartPage;