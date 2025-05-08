import React from 'react';
import './BudgetWarning.css';

const BudgetWarning = ({ expensesTotal, budgetAmount }) => {
  const ratio = expensesTotal / budgetAmount;
  const warningThreshold = 0.8;
  
  if (ratio < warningThreshold) return null;

  return (
    <div className="budget-warning">
      <div className="warning-content">
        ⚠️ Warning: You've spent {Math.round(ratio * 100)}% of your budget!
      </div>
    </div>
  );
};

export default BudgetWarning;