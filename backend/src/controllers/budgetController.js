const Budget = require('../models/Budget');

exports.getBudget = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400);
      throw new Error('Please provide a valid year and month (1-12)');
    }

    const budget = await Budget.findOne({
      userId: req.user.id,
      year,
      month,
    });

    res.status(200).json({
      success: true,
      data: budget || { year, month, amount: 0 },
    });
  } catch (error) {
    next(error);
  }
};

exports.upsertBudget = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const { amount } = req.body;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400);
      throw new Error('Please provide a valid year and month (1-12)');
    }

    if (amount === undefined || amount === null || amount < 0) {
      res.status(400);
      throw new Error('Please provide a valid non-negative budget amount');
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, year, month },
      { amount: parseFloat(amount) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month)) {
      res.status(400);
      throw new Error('Please provide a valid year and month');
    }

    const budget = await Budget.findOneAndDelete({
      userId: req.user.id,
      year,
      month,
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found for this month and year');
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
