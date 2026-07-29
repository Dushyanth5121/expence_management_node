// modules/categories/category.routes.js
const router = require('express').Router();
const CategoryController = require('./category.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { validate } = require('../../shared/middleware/validation.middleware');
const { body, param, query } = require('express-validator');

// Validation rules
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
    .escape()
];

const updateCategoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Invalid category ID format'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
    .escape(),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

const categoryIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Invalid category ID format')
];

const getCategoriesValidation = [
  query('search')
    .optional()
    .isString()
    .trim(),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number')
];

// All routes require authentication
router.use(authMiddleware);

// Category routes
router.post(
  '/create',
  validate(createCategoryValidation),
  CategoryController.createCategory
);

router.get(
  '/list',
  validate(getCategoriesValidation),
  CategoryController.getCategories
);

router.get(
  '/stats',
  CategoryController.getCategoryStats
);

router.get(
  '/get/:id',
  validate(categoryIdValidation),
  CategoryController.getCategory
);

router.put(
  '/update/:id',
  validate(updateCategoryValidation),
  CategoryController.updateCategory
);

router.delete(
  '/delete/:id',
  validate(categoryIdValidation),
  CategoryController.deleteCategory
);

router.delete(
  '/permanent-delete/:id',
  validate(categoryIdValidation),
  CategoryController.permanentDeleteCategory
);

module.exports = router;