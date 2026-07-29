// modules/expenses/expense.routes.js
const router = require('express').Router();
const ExpenseController = require('./expense.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { validate } = require('../../shared/middleware/validation.middleware');
const { body, param, query } = require('express-validator');

// Validation rules
const createExpenseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category_id')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Invalid category ID'),
  body('expense_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('payment_method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'Card', 'UPI', 'BankTransfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim()
    .escape()
];

const updateExpenseValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required'),
  body('title')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category_id')
    .optional()
    .isString()
    .withMessage('Invalid category ID'),
  body('expense_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('payment_method')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'BankTransfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim()
    .escape()
];

const expenseIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required')
];

const getExpensesValidation = [
  query('search')
    .optional()
    .isString()
    .trim(),
  query('category_id')
    .optional()
    .isString(),
  query('payment_method')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'BankTransfer', 'Other'])
    .withMessage('Invalid payment method'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('min_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  query('max_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number'),
  query('orderBy')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order by must be asc or desc')
];

const monthlySummaryValidation = [
  param('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Invalid year'),
  param('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12')
];

// All routes require authentication
router.use(authMiddleware);

// Expense routes
router.post(
  '/createExpense',
  validate(createExpenseValidation),
  ExpenseController.createExpense
);

router.get(
  '/getExpenses',
  validate(getExpensesValidation),
  ExpenseController.getExpenses
);

router.get(
  '/expenses/stats',
  ExpenseController.getExpenseStats
);

router.get(
  '/expenses/monthly/:year/:month',
  validate(monthlySummaryValidation),
  ExpenseController.getMonthlySummary
);

router.get(
  '/expenses/:id',
  validate(expenseIdValidation),
  ExpenseController.getExpense
);

router.put(
  '/expenses/:id',
  validate(updateExpenseValidation),
  ExpenseController.updateExpense
);

router.delete(
  '/expenses/:id',
  validate(expenseIdValidation),
  ExpenseController.deleteExpense
);

module.exports = router;