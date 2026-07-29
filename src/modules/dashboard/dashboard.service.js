// modules/dashboard/dashboard.service.js
const DashboardModel = require('./dashboard.model');
const { AppError } = require('../../shared/utils/helpers');

class DashboardService {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(userId) {
    const data = await DashboardModel.getDashboardData(userId);
    
    // Add some derived insights
    return {
      ...data,
      insights: this.generateInsights(data)
    };
  }

  /**
   * Get dashboard summary only
   */
  async getDashboardSummary(userId) {
    return await DashboardModel.getDashboardSummary(userId);
  }

  /**
   * Generate insights from dashboard data
   */
  generateInsights(data) {
    const insights = [];

    // Highest spending category
    if (data.category_breakdown && data.category_breakdown.length > 0) {
      const topCategory = data.category_breakdown[0];
      insights.push({
        type: 'top_category',
        message: `You spent the most on "${topCategory.category_name}" (${topCategory.total.toFixed(2)})`,
        data: topCategory
      });
    }

    // Compare with previous month
    if (data.monthly_summary && data.monthly_summary.length >= 2) {
      const currentMonth = data.monthly_summary[data.monthly_summary.length - 1];
      const previousMonth = data.monthly_summary[data.monthly_summary.length - 2];
      
      if (currentMonth && previousMonth) {
        const change = currentMonth.total - previousMonth.total;
        const percentage = previousMonth.total > 0 ? (change / previousMonth.total) * 100 : 0;
        
        insights.push({
          type: 'monthly_change',
          message: `${change > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(percentage).toFixed(1)}% from last month`,
          data: {
            current_month: currentMonth.total,
            previous_month: previousMonth.total,
            change: change,
            percentage: percentage
          }
        });
      }
    }

    // Average daily spending
    if (data.daily_trend && data.daily_trend.length > 0) {
      const avgDaily = data.daily_trend.reduce((sum, d) => sum + d.total, 0) / data.daily_trend.length;
      insights.push({
        type: 'average_daily',
        message: `Average daily spending: ${avgDaily.toFixed(2)}`,
        data: { average_daily: avgDaily }
      });
    }

    // Most used payment method
    if (data.payment_breakdown && data.payment_breakdown.length > 0) {
      const topPayment = data.payment_breakdown.sort((a, b) => b.count - a.count)[0];
      insights.push({
        type: 'top_payment_method',
        message: `You mostly use "${topPayment.method}" for payments`,
        data: topPayment
      });
    }

    return insights;
  }
}

module.exports = new DashboardService();