import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import AddExpensePopup from '../components/AddExpensePopup';
import WarningDialog from '../components/WarningDialog';
import BudgetWarning from '../components/BudgetWarning';
import { useUser } from '../UserContext';
import './Homepage.css';

const Homepage = () => {
    const { userID } = useUser()

    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showPopup, setShowPopup] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [budgetAmount, setBudgetAmount] = useState(0);
    const [budgetRatio, setBudgetRatio] = useState(0.1);
    const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

    useEffect(() => {
        refreshData();
    }, [monthFilter, yearFilter, currentPage, userID]);

    const itemsPerPage = 10;

    const getFilteredExpenses = () => {
        if (!monthFilter) return expenses;

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return (
                expenseDate.getMonth() + 1 === parseInt(monthFilter) &&
                expenseDate.getFullYear() === parseInt(yearFilter)
            );
        });
    };

    const filteredExpenses = getFilteredExpenses();
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleAddExpense = async (newExpense) => {
        try {
            console.log(newExpense)
            if (editingExpense) {
                const updatedExpense = {
                    description: newExpense.description.replace(/[\r\n]+/g, ''),
                    ...newExpense,
                };

                // Update existing expense
                await axios.put(`http://localhost:3003/api/expense/${editingExpense.expenseID}`, updatedExpense);
            } else {
                // Create new expense
                await axios.post('http://localhost:3003/api/expense', newExpense);
            }

            // Refresh data after operation
            refreshData();
            setShowPopup(false);
            setEditingExpense(null);
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowPopup(true);

        if (monthFilter) {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getMonth() + 1 !== parseInt(monthFilter) ||
                expenseDate.getFullYear() !== parseInt(yearFilter)) {
                setMonthFilter('');
                setCurrentPage(1);
            }
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            // console.log(id)
              await axios.delete(`http://localhost:3003/api/expense/${id}`);
            refreshData();

            if (expenses.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
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
            handleDeleteExpense(expenseToDelete.expenseID);
            setExpenseToDelete(null);
        }
    };

    const cancelDeleteExpense = () => {
        setExpenseToDelete(null);
    };

    const refreshData = async () => {
        try {
            const [expensesRes, totalRes, budgetRes, ratioRes] = await Promise.all([
                axios.post(`http://localhost:3003/api/expense/mny/${currentPage}`, {
                    userID: userID,
                    month: parseInt(monthFilter),
                    year: parseInt(yearFilter),
                }),
                axios.post('http://localhost:3003/api/expense/mny/sum', {
                    userID: userID,
                    month: parseInt(monthFilter),
                    year: parseInt(yearFilter),
                }),
                axios.post(`http://localhost:3001/api/budget/mny`, {
                    userID: userID,
                    month: parseInt(monthFilter),
                    year: parseInt(yearFilter),
                }),
                axios.post(`http://localhost:3001/api/budget/check`, {
                    userID: userID,
                    month: parseInt(monthFilter),
                    year: parseInt(yearFilter),
                })
            ]);

            setExpenses(expensesRes.data);
            setTotalExpenses(totalRes.data);
            setBudgetAmount(budgetRes.data[0] ? parseFloat(budgetRes.data[0].amount) : 0);
            setBudgetRatio(ratioRes.data || 0.1);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    return (
        <div className="homepage">
            <Header />
            <BudgetWarning budgetRatio={budgetRatio} />
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
                    <div className="date-filter">
                        <select
                            value={monthFilter}
                            onChange={(e) => {
                                setMonthFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="month-dropdown"
                            required
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                </option>
                            ))}
                        </select>

                        <select
                            value={yearFilter}
                            onChange={(e) => {
                                setYearFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="year-dropdown"
                            required
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>

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
                                        No expenses found for selected period
                                    </td>
                                </tr>
                            ) : (
                                currentExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>{expense.categoryName}</td>
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
                            disabled={filteredExpenses.length === 0}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={handleNext} disabled={currentPage === totalPages || filteredExpenses.length === 0}>
                        Next »
                    </button>
                </div>

                <button className="add-button" onClick={() => setShowPopup(true)}>
                    +
                </button>

                {showPopup && (
                    <AddExpensePopup
                        onClose={handleCancelEdit}
                        onAddExpense={handleAddExpense}
                        expenseToEdit={editingExpense}
                        onDeleteExpensesByCategory={handleDeleteExpensesByCategory}
                        selectedMonth={monthFilter}
                        selectedYear={yearFilter}
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