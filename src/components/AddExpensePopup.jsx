import React, { useState, useEffect } from 'react';
import WarningDialog from './WarningDialog';
import axios from 'axios';
import { useUser } from '../UserContext';
import './AddExpensePopup.css';

const AddExpensePopup = ({
    onClose,
    onAddExpense,
    expenseToEdit,
    onDeleteExpensesByCategory,
    selectedMonth,
    selectedYear
}) => {
    const { userID } = useUser()
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [categoryToRemove, setCategoryToRemove] = useState(null);
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`http://localhost:3002/api/category/user/${userID}`);
                setCategories(response.data);
                if (response.data.length > 0) {
                    setCategory(response.data[0].name); // Assuming API returns {id, name} objects
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load categories');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (expenseToEdit) {
            setCategory(expenseToEdit.category);
            setAmount(expenseToEdit.amount.toString());
            setDescription(expenseToEdit.description);

            const expenseDate = new Date(expenseToEdit.date);
            setDate(formatDateForInput(expenseDate));
        } else {
            const defaultDate = new Date();
            if (selectedYear && selectedMonth) {
                defaultDate.setFullYear(selectedYear);
                defaultDate.setMonth(selectedMonth - 1);
                defaultDate.setDate(1);
            }
            setDate(formatDateForInput(defaultDate));
        }
    }, [expenseToEdit, selectedMonth, selectedYear]);

    const formatDateForInput = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const getDateConstraints = () => {
        if (selectedYear && selectedMonth) {
            const year = selectedYear;
            const month = selectedMonth;

            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);

            return {
                min: formatDateForInput(firstDay),
                max: formatDateForInput(lastDay)
            };
        }
        return {};
    };

    const handleCategoryChange = (e) => {
        const selected = e.target.value;
        setCategory(selected);
        setShowCustomInput(selected === 'Other');
        if (selected !== 'Other') setCustomCategory('');
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9,]/g, '');
        if ((value.match(/,/g) || []).length > 1) return;
        setAmount(value);
    };

    const formatAmount = (value) =>
        value ? `Rp. ${value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description || !date) return;

        const finalCategory = category === 'Other' && customCategory ? customCategory : category;

        const categoryObj = categories.find(cat =>
            cat.name === finalCategory
        );

        if (!categoryObj && (category === 'Other' && customCategory)) {
            try {
                // Add the new category to API
                const response = await axios.post('http://localhost:3002/api/category/', { 
                    userID: userID,
                    name: customCategory });
                // Update local state
                setCategories(prev => [...prev, response.data]);

                // Use the newly created category
                const newExpense = {
                    userID: userID,
                    categoryID: response.data.categoryID, // Use the ID from API response
                    categoryName: response.data.name,
                    amount: parseInt(amount.replace(/\D/g, '')),
                    description,
                    date: date,
                };
                onAddExpense(newExpense);
                onClose();
                return;
            } catch (err) {
                console.error('Failed to add category', err);
                return;
            }
        }

        // For existing categories
        const newExpense = {
            userID: userID,
            categoryID: categoryObj.categoryID, // Use the ID from found category
            categoryName: categoryObj.name,
            amount: parseInt(amount.replace(/\D/g, '')),
            description,
            date: date,
        };


        onAddExpense(newExpense);
        onClose();
    };

    const handleRemoveCategory = async () => {
        try {
            await axios.delete(`/api/categories/${categoryToRemove}`);

            // Update local state
            const updated = categories.filter(c => c.name !== categoryToRemove);
            setCategories(updated);

            onDeleteExpensesByCategory(categoryToRemove);
            if (category === categoryToRemove) {
                setCategory(categories[0]?.name || '');
            }
            setCategoryToRemove(null);
        } catch (err) {
            console.error('Failed to delete category', err);
        }
    };

    if (loading) return <div className="popup">Loading categories...</div>;
    if (error) return <div className="popup">Error: {error}</div>;

    return (
        <div className="popup">
            <div className="popup-content">
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h3>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                            className="form-control"
                            {...getDateConstraints()}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <select value={category} onChange={handleCategoryChange} className="form-control" required>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                            <option value="Other">Other...</option>
                        </select>
                    </div>

                    {showCustomInput && (
                        <div className="form-group">
                            <input
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Enter custom category"
                                className="form-control"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="text"
                            value={formatAmount(amount)}
                            onChange={handleAmountChange}
                            placeholder="Rp. xxx.xxx"
                            inputMode="numeric"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="form-control"
                        />
                    </div>


                    <button type="submit" className="submit-btn">
                        {expenseToEdit ? 'Save Changes' : 'Add'}
                    </button>
                </form>

                {categoryToRemove && (
                    <WarningDialog
                        message={`Are you sure you want to remove "${categoryToRemove}"?\nAll expenses in this category will be deleted.`}
                        onConfirm={handleRemoveCategory}
                        onCancel={() => setCategoryToRemove(null)}
                        confirmText="Delete"
                    />
                )}
            </div>
        </div>
    );
};

export default AddExpensePopup;