const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/:year/:month')
  .get(budgetController.getBudget)
  .put(budgetController.upsertBudget)
  .delete(budgetController.deleteBudget);

module.exports = router;
