// modules/auth/auth.routes.js
const router = require('express').Router();
const AuthController = require('./auth.controller');
const { validate } = require('../../shared/middleware/validation.middleware');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const updateProfileValidation = [
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Routes
router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);
router.get('/get-profile', authMiddleware, AuthController.getProfile);
router.put('/update-profile', authMiddleware, validate(updateProfileValidation), AuthController.updateProfile);
router.get('/logout', authMiddleware, AuthController.logout);  // Changed from POST to GET

module.exports = router;