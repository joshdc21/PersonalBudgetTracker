const Expense = require('../models/Expense');

exports.getExpenses = async (req, res, next) => {
  try {
    const { year, month, category } = req.query;
    const filter = { userId: req.user.id };

    if (category) {
      filter.category = category;
    }

    if (year) {
      const yearNum = parseInt(year);
      if (month) {
        const monthNum = parseInt(month);
        const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
        const endDate = new Date(Date.UTC(yearNum, monthNum, 1));
        filter.date = { $gte: startDate, $lt: endDate };
      } else {
        const startDate = new Date(Date.UTC(yearNum, 0, 1));
        const endDate = new Date(Date.UTC(yearNum + 1, 0, 1));
        filter.date = { $gte: startDate, $lt: endDate };
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { amount, description, category, date } = req.body;

    if (!amount || !description || !category) {
      res.status(400);
      throw new Error('Please provide amount, description, and category');
    }

    const expenseDate = date ? new Date(date) : new Date();

    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      description,
      category,
      date: expenseDate,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { amount, description, category, date } = req.body;

    let expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.description = description !== undefined ? description : expense.description;
    expense.category = category !== undefined ? category : expense.category;
    expense.date = date ? new Date(date) : expense.date;

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
