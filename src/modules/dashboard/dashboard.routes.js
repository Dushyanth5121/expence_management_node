// modules/dashboard/dashboard.routes.js
const router = require('express').Router();
const DashboardController = require('./dashboard.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get complete dashboard data (all in one)
router.get('/dashboard-data', DashboardController.getDashboard);

// Get dashboard summary only (lighter response)
router.get('/dashboard-summary-data', DashboardController.getDashboardSummary);

module.exports = router;