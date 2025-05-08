import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './ChartPage.css';

const ChartPage = ({ expenses, setExpenses }) => {
  const defaultColors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'];
  const [categoryColors, setCategoryColors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const initialColors = {};
    const uniqueCategories = [...new Set(expenses.map((e) => e.category))];
    uniqueCategories.forEach((cat, index) => {
      initialColors[cat] = categoryColors[cat] || defaultColors[index % defaultColors.length];
    });
    setCategoryColors(initialColors);
  }, [expenses]);

  let categoryData;
  if (expenses.length === 0) {
    categoryData = [
      { category: 'Food', amount: 50000, percentage: '50.0', color: '#4dc9f6' },
      { category: 'Transport', amount: 30000, percentage: '30.0', color: '#f67019' },
      { category: 'Entertainment', amount: 20000, percentage: '20.0', color: '#f53794' },
      { category: 'Daily', amount: 20000, percentage: '20.0', color: '#537bc4' },
      { category: 'Mobile Legend', amount: 20000, percentage: '20.0', color: '#f53794' }
    ];
  } else {
    const totals = {};
    let totalAmount = 0;

    expenses.forEach(({ category, amount }) => {
      if (!totals[category]) totals[category] = 0;
      totals[category] += amount;
      totalAmount += amount;
    });

    categoryData = Object.entries(totals).map(([category, amount], index) => ({
      category,
      amount,
      percentage: ((amount / totalAmount) * 100).toFixed(1),
      color: categoryColors[category] || defaultColors[index % defaultColors.length],
    }));
  }

  const totalPages = Math.ceil(categoryData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categoryData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleColorChange = (category, color) => {
    setCategoryColors((prev) => ({
      ...prev,
      [category]: color,
    }));
  };

  const totalAmount = categoryData.reduce((sum, e) => sum + e.amount, 0);

  const dataForChart = categoryData.map(({ category, amount }, index) => ({
    name: category,
    value: amount,
    color: categoryColors[category] || defaultColors[index % defaultColors.length],
  }));

  return (
    <div className="chart-page">
      <Header />
      <main className="chart-content">
        <h1>Total Expenses</h1>

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
            Rp. {totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="category-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>%</th>
                <th>Amount</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map(({ category, percentage, amount }, idx) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{percentage}%</td>
                  <td>-Rp. {amount.toLocaleString()}</td>
                  <td>
                  <input
                  type="color"
                  value={categoryData.find(c => c.category === category)?.color || '#000000'}
                  onChange={(e) => handleColorChange(category, e.target.value)}
                  />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChartPage;