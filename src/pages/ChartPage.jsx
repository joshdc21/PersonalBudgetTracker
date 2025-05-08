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
  let totalAmount = 0;

  if (expenses.length === 0) {
    categoryData = [
      { category: 'Food', amount: 50000, color: '#4dc9f6' },
      { category: 'Transport', amount: 30000, color: '#f67019' },
      { category: 'Entertainment', amount: 20000, color: '#f53794' },
      { category: 'Daily', amount: 20000, color: '#537bc4' }
    ];
    totalAmount = categoryData.reduce((sum, e) => sum + e.amount, 0);
    
    categoryData.forEach(item => {
      if (!categoryColors[item.category]) {
        setCategoryColors(prev => ({
          ...prev,
          [item.category]: item.color
        }));
      }
    });
    
    categoryData = categoryData.map(item => ({
      ...item,
      percentage: ((item.amount / totalAmount) * 100).toFixed(1),
      color: categoryColors[item.category] || item.color
    }));
  } else {
    const totals = {};
    expenses.forEach(({ category, amount }) => {
      if (!totals[category]) totals[category] = 0;
      totals[category] += amount;
      totalAmount += amount;
    });

    categoryData = Object.entries(totals).map(([category, amount], index) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0.0',
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

  const dataForChart = categoryData.map(({ category, amount, color }) => ({
    name: category,
    value: amount,
    color: categoryColors[category] || color,
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
              {currentCategories.map(({ category, percentage, amount }) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{percentage}%</td>
                  <td>-Rp. {amount.toLocaleString()}</td>
                  <td>
                    <input
                      type="color"
                      value={categoryColors[category] || 
                        defaultColors[
                          categoryData.findIndex(item => item.category === category) % defaultColors.length
                        ]}
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