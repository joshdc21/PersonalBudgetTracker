import React from 'react';
import './BudgetWarning.css';

const BudgetWarning = ({ budgetRatio }) => {
  const warningThreshold = 0.8;
  
  if (budgetRatio < warningThreshold) return null;

  return (
    <div className="budget-warning">
      <div className="warning-content">
        ⚠️ Warning: You've spent {budgetRatio * 100}% of your budget!
      </div>
    </div>
  );
};

export default BudgetWarning;