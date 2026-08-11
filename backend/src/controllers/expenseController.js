const Expense = require('../models/Expense');

const parseUtcMidnight = (dateInput) => {
  if (!dateInput) {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Date.UTC(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])));
    }
  }
  
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date format');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};


exports.getExpenses = async (req, res, next) => {
  try {
    const { year, month, category, page, limit, sortBy } = req.query;
    const filter = { userId: req.user.id };

    if (category) {
      if (typeof category !== 'string') {
        res.status(400);
        throw new Error('Category must be a string');
      }
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

    // Determine sorting options
    let sortOptions = { date: -1 }; // default: newest first
    if (sortBy === 'date-asc') {
      sortOptions = { date: 1 };
    } else if (sortBy === 'amount-asc') {
      sortOptions = { amount: 1 };
    } else if (sortBy === 'amount-desc') {
      sortOptions = { amount: -1 };
    }

    // Calculate total amount spent for this filter
    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Calculate total count
    const total = await Expense.countDocuments(filter);

    // Apply pagination skip and limit
    let pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || 5;
    if (pageNum < 1) pageNum = 1;
    if (limitNum < 1) limitNum = 5;
    const skip = (pageNum - 1) * limitNum;

    const expenses = await Expense.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        total,
        totalAmount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
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

    if (category !== undefined && typeof category !== 'string') {
      res.status(400);
      throw new Error('Category must be a string');
    }
    if (description !== undefined && typeof description !== 'string') {
      res.status(400);
      throw new Error('Description must be a string');
    }
    if (date !== undefined && typeof date !== 'string') {
      res.status(400);
      throw new Error('Date must be a string');
    }

    if (!amount || !description || !category) {
      res.status(400);
      throw new Error('Please provide amount, description, and category');
    }

    let expenseDate;
    try {
      expenseDate = parseUtcMidnight(date);
    } catch (err) {
      res.status(400);
      throw new Error('Invalid date format');
    }

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

    if (category !== undefined && typeof category !== 'string') {
      res.status(400);
      throw new Error('Category must be a string');
    }
    if (description !== undefined && typeof description !== 'string') {
      res.status(400);
      throw new Error('Description must be a string');
    }
    if (date !== undefined && typeof date !== 'string') {
      res.status(400);
      throw new Error('Date must be a string');
    }

    let expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.description = description !== undefined ? description : expense.description;
    expense.category = category !== undefined ? category : expense.category;
    
    if (date) {
      try {
        expense.date = parseUtcMidnight(date);
      } catch (err) {
        res.status(400);
        throw new Error('Invalid date format');
      }
    }

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
