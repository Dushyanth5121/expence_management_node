// modules/dashboard/dashboard.controller.js
const DashboardService = require('./dashboard.service');
const { catchAsync } = require('../../shared/utils/helpers');

class DashboardController {
  /**
   * Get complete dashboard data
   */
  getDashboard = catchAsync(async (req, res) => {
    const data = await DashboardService.getDashboardData(req.user.id);
    
    res.json({
      success: true,
      data: data
    });
  });

  /**
   * Get dashboard summary only (lighter response)
   */
  getDashboardSummary = catchAsync(async (req, res) => {
    const data = await DashboardService.getDashboardSummary(req.user.id);
    
    res.json({
      success: true,
      data: data
    });
  });
}

module.exports = new DashboardController();