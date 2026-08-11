const mongoose = require('mongoose');

const VALID_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Other'];

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be a positive number'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: VALID_CATEGORIES,
      message: '{VALUE} is not a valid category',
    },
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for querying by user, date, and category
expenseSchema.index({ userId: 1, date: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.VALID_CATEGORIES = VALID_CATEGORIES;
