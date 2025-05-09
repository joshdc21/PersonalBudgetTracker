import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useUser } from '../UserContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './ChartPage.css';
import axios from 'axios'; // Add this if using axios

const ChartPage = () => {
    const { userID } = useUser()
    console.log(userID)

    const defaultColors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'];
    const [expenses, setExpenses] = useState([]);
    const [categoryColors, setCategoryColors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // === Fetch expenses from API ===
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await axios.post(`http://localhost:3003/api/expense/mny/gbC`, {
                    userID: userID,
                    month: 5,
                    year: 2025
                }); // Adjust endpoint as needed

                const data = []
                for (let key in res.data) {
                    const sd = {}
                    sd.category = key
                    sd.amount = res.data[key]
                    data.push(sd)
                }
                setExpenses(data);
            } catch (err) {
                console.error('Failed to fetch expenses:', err);
            }
        };

        fetchExpenses();
    }, []);

    // === Set color map for categories ===
    useEffect(() => {
        const initialColors = {};
        const uniqueCategories = [...new Set(expenses.map((e) => e.category))];
        uniqueCategories.forEach((cat, index) => {
            initialColors[cat] = categoryColors[cat] || defaultColors[index % defaultColors.length];
        });
        setCategoryColors((prev) => ({ ...initialColors }));
    }, [expenses]);

    // === Calculate chart and table data ===
    let categoryData;
    let totalAmount = 0;

    if (expenses.length === 0) {
        categoryData = [];
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

    // === Pagination logic ===
    const totalPages = Math.ceil(categoryData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categoryData.slice(indexOfFirstItem, indexOfLastItem);

    // === Event handlers ===
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
                                            value={categoryColors[category] || defaultColors[categoryData.findIndex(item => item.category === category) % defaultColors.length]}
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
