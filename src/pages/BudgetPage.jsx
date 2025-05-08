import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AddBudgetPopup from '../components/AddBudgetPopup';
import WarningDialog from '../components/WarningDialog';
import './BudgetPage.css';
import axios from 'axios'; // Ensure axios is installed

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch budgets from API on component mount
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const userID = 1
                const response = await axios.get(`http://localhost:3001/api/budget/user/${userID}/${currentPage}`);

                setBudgets(response.data.budgets);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching budgets:', err);
                setError('Failed to load budgets.');
                setLoading(false);
            }
        };

        fetchBudgets();
    }, []);

    if (budgets.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
    }

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleAddBudget = async (newBudget) => {
        try {
            if (editingBudget) {
                // Update existing budget
                const response = await axios.put(`/api/budgets/${editingBudget.id}`, newBudget);
                setBudgets((prev) =>
                    prev.map((budget) =>
                        budget.id === editingBudget.id ? response.data : budget
                    )
                );
                setEditingBudget(null);
            } else {
                // Add new budget
                const response = await axios.post('/api/budgets', newBudget);
                setBudgets((prev) => [response.data, ...prev]);
            }
            setShowPopup(false);
        } catch (err) {
            console.error('Error saving budget:', err);
            setError('Failed to save budget.');
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setShowPopup(true);
    };

    const handleDeleteBudget = async (id) => {
        try {
            await axios.delete(`/api/budgets/${id}`);
            setBudgets((prev) => prev.filter((budget) => budget.id !== id));
            if (currentBudgets.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (err) {
            console.error('Error deleting budget:', err);
            setError('Failed to delete budget.');
        }
    };

    const handleCancelEdit = () => {
        setEditingBudget(null);
        setShowPopup(false);
    };

    const confirmDeleteBudget = () => {
        if (budgetToDelete) {
            handleDeleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
        }
    };

    const cancelDeleteBudget = () => {
        setBudgetToDelete(null);
    };

    return (
        <div className="budget-page">
            <Header />

            <main className="budget-content">
                <h1 className="budget-title">Budget Management</h1>

                {loading ? (
                    <p>Loading budgets...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="budget-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Year</th>
                                        <th>Budget Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgets.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center' }}>
                                                No budgets to show
                                            </td>
                                        </tr>
                                    ) : (
                                        budgets.map((budget) => (
                                            <tr key={budget.id}>
                                                <td>{budget.month}</td>
                                                <td>{budget.year}</td>
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
                                                        onClick={() => setBudgetToDelete(budget)}
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
                            <button onClick={handlePrev} disabled={currentPage === 1}>
                                « Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={handleNext} disabled={currentPage === totalPages}>
                                Next »
                            </button>
                        </div>
                    </>
                )}
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

            {budgetToDelete && (
                <WarningDialog
                    message={`Are you sure you want to delete this budget for "${budgetToDelete.monthYear}"?`}
                    subMessage={`Amount: Rp. ${budgetToDelete.amount.toLocaleString()}`}
                    onConfirm={confirmDeleteBudget}
                    onCancel={cancelDeleteBudget}
                    confirmText="Delete"
                />
            )}
        </div>
    );
};

export default BudgetPage;
