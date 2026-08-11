const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getExpenseAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year) : now.getUTCFullYear();
    const month = req.query.month ? parseInt(req.query.month) : now.getUTCMonth() + 1;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400);
      throw new Error('Please provide a valid year and month');
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const categoryStats = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const totalExpenses = categoryStats.reduce((sum, item) => sum + item.amount, 0);

    const byCategory = categoryStats.map((item) => ({
      category: item._id,
      amount: item.amount,
      percentage: totalExpenses > 0 ? parseFloat(((item.amount / totalExpenses) * 100).toFixed(2)) : 0,
    }));

    const allCategories = ['Food', 'Transport', 'Entertainment', 'Other'];
    allCategories.forEach((cat) => {
      if (!byCategory.find((item) => item.category === cat)) {
        byCategory.push({
          category: cat,
          amount: 0,
          percentage: 0,
        });
      }
    });

    const budgetDoc = await Budget.findOne({
      userId: req.user.id,
      year,
      month,
    });
    const budgetAmount = budgetDoc ? budgetDoc.amount : 0;

    const remaining = budgetAmount - totalExpenses;
    const percentageUsed = budgetAmount > 0 ? parseFloat(((totalExpenses / budgetAmount) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        byCategory: byCategory.sort((a, b) => b.amount - a.amount),
        budget: budgetAmount,
        spent: totalExpenses,
        remaining,
        percentageUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};
