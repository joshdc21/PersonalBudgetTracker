const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

// All expense routes require authentication
router.use(auth);

router.route('/')
  .get(expenseController.getExpenses)
  .post(expenseController.createExpense);

router.route('/:id')
  .get(expenseController.getExpenseById)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
