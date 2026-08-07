// modules/search/search.routes.js
const router = require('express').Router();
const SearchController = require('./search.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { validate } = require('../../shared/middleware/validation.middleware');
const { query } = require('express-validator');

// Validation rules
const searchValidation = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  query('title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  query('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  query('category_id')
    .optional()
    .isString()
    .withMessage('Invalid category ID'),
  query('category_name')
    .optional()
    .isString()
    .trim()
    .withMessage('Invalid category name'),
  query('payment_method')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'BankTransfer', 'Other'])
    .withMessage('Invalid payment method'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format (YYYY-MM-DD)'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format (YYYY-MM-DD)'),
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
// All routes require authentication
router.use(authMiddleware);

// Search routes
router.get(
  '/expenses',
  validate(searchValidation),
  SearchController.searchExpenses
);

module.exports = router;