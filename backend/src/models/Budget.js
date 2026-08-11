const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be after 2000'],
    max: [2099, 'Year must be before 2099'],
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Budget amount cannot be negative'],
  },
}, {
  timestamps: true,
});

// Compound unique index for year + month per user
budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
