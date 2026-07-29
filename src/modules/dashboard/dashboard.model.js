// modules/dashboard/dashboard.model.js
const prisma = require('../../shared/config/prisma');

class DashboardModel {
  /**
   * Get all dashboard data in one query
   */
  async getDashboardData(userId) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get all expenses for the user (with date filters)
      const allExpenses = await prisma.expense.findMany({
        where: {
          user_id: userId
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          expense_date: 'desc'
        }
      });

      // Filter expenses by date ranges
      const todayExpenses = allExpenses.filter(e => 
        e.expense_date >= today && e.expense_date < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      );

      const weekExpenses = allExpenses.filter(e => 
        e.expense_date >= startOfWeek
      );

      const monthExpenses = allExpenses.filter(e => 
        e.expense_date >= startOfMonth
      );

      const yearExpenses = allExpenses.filter(e => 
        e.expense_date >= startOfYear
      );

      // Calculate totals
      const calculateTotals = (expenses) => {
        return {
          total: expenses.reduce((sum, e) => sum + e.amount, 0),
          count: expenses.length,
          average: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
          max: expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0,
          min: expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0
        };
      };

      // Category-wise totals for current month
      const categoryTotals = {};
      monthExpenses.forEach(expense => {
        const categoryName = expense.category?.name || 'Uncategorized';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            category_id: expense.category_id,
            category_name: categoryName,
            total: 0,
            count: 0,
            expenses: []
          };
        }
        categoryTotals[categoryName].total += expense.amount;
        categoryTotals[categoryName].count += 1;
        categoryTotals[categoryName].expenses.push(expense);
      });

      // Monthly expense summary (last 12 months)
      const monthlySummary = [];
      for (let i = 0; i < 12; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

        const monthExpensesFiltered = allExpenses.filter(e => 
          e.expense_date >= monthStart && e.expense_date <= monthEnd
        );

        const total = monthExpensesFiltered.reduce((sum, e) => sum + e.amount, 0);
        const count = monthExpensesFiltered.length;

        monthlySummary.push({
          year: month.getFullYear(),
          month: month.getMonth() + 1,
          month_name: month.toLocaleString('default', { month: 'long' }),
          total: total,
          count: count,
          average: count > 0 ? total / count : 0
        });
      }

      // Recent expenses (last 10)
      const recentExpenses = allExpenses.slice(0, 10);

      // Payment method breakdown for current month
      const paymentBreakdown = {};
      monthExpenses.forEach(expense => {
        const method = expense.payment_method;
        if (!paymentBreakdown[method]) {
          paymentBreakdown[method] = {
            method: method,
            total: 0,
            count: 0
          };
        }
        paymentBreakdown[method].total += expense.amount;
        paymentBreakdown[method].count += 1;
      });

      // Daily expense trend for current month
      const dailyTrend = {};
      monthExpenses.forEach(expense => {
        const date = expense.expense_date.toISOString().split('T')[0];
        if (!dailyTrend[date]) {
          dailyTrend[date] = {
            date: date,
            total: 0,
            count: 0
          };
        }
        dailyTrend[date].total += expense.amount;
        dailyTrend[date].count += 1;
      });

      // Daily trend array sorted by date
      const dailyTrendArray = Object.values(dailyTrend).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      return {
        // Summary cards
        summary: {
          today: {
            total: calculateTotals(todayExpenses).total,
            count: calculateTotals(todayExpenses).count,
            average: calculateTotals(todayExpenses).average,
            max: calculateTotals(todayExpenses).max,
            min: calculateTotals(todayExpenses).min
          },
          week: {
            total: calculateTotals(weekExpenses).total,
            count: calculateTotals(weekExpenses).count,
            average: calculateTotals(weekExpenses).average,
            max: calculateTotals(weekExpenses).max,
            min: calculateTotals(weekExpenses).min
          },
          month: {
            total: calculateTotals(monthExpenses).total,
            count: calculateTotals(monthExpenses).count,
            average: calculateTotals(monthExpenses).average,
            max: calculateTotals(monthExpenses).max,
            min: calculateTotals(monthExpenses).min
          },
          year: {
            total: calculateTotals(yearExpenses).total,
            count: calculateTotals(yearExpenses).count,
            average: calculateTotals(yearExpenses).average,
            max: calculateTotals(yearExpenses).max,
            min: calculateTotals(yearExpenses).min
          },
          all_time: {
            total: calculateTotals(allExpenses).total,
            count: calculateTotals(allExpenses).count,
            average: calculateTotals(allExpenses).average,
            max: calculateTotals(allExpenses).max,
            min: calculateTotals(allExpenses).min
          }
        },
        // Category-wise totals (for current month)
        category_breakdown: Object.values(categoryTotals).map(cat => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          total: cat.total,
          count: cat.count,
          percentage: monthExpenses.length > 0 ? (cat.total / calculateTotals(monthExpenses).total) * 100 : 0
        })).sort((a, b) => b.total - a.total),
        // Monthly summary (last 12 months)
        monthly_summary: monthlySummary.reverse(),
        // Recent expenses
        recent_expenses: recentExpenses.map(e => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          category: e.category?.name || 'Uncategorized',
          payment_method: e.payment_method,
          expense_date: e.expense_date,
          description: e.description
        })),
        // Payment method breakdown
        payment_breakdown: Object.values(paymentBreakdown),
        // Daily trend
        daily_trend: dailyTrendArray,
        // Quick stats
        quick_stats: {
          total_expenses: allExpenses.length,
          total_spent: allExpenses.reduce((sum, e) => sum + e.amount, 0),
          average_per_expense: allExpenses.length > 0 ? allExpenses.reduce((sum, e) => sum + e.amount, 0) / allExpenses.length : 0,
          total_categories: new Set(allExpenses.map(e => e.category_id)).size,
          most_used_payment: this.getMostUsedPayment(allExpenses)
        }
      };
    } catch (error) {
      throw new Error(`Error getting dashboard data: ${error.message}`);
    }
  }

  /**
   * Get most used payment method
   */
  getMostUsedPayment(expenses) {
    const paymentCount = {};
    expenses.forEach(e => {
      paymentCount[e.payment_method] = (paymentCount[e.payment_method] || 0) + 1;
    });
    let maxCount = 0;
    let mostUsed = 'Other';
    for (const [method, count] of Object.entries(paymentCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = method;
      }
    }
    return mostUsed;
  }

  /**
   * Get dashboard summary only (lighter response)
   */
  async getDashboardSummary(userId) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const expenses = await prisma.expense.findMany({
        where: {
          user_id: userId
        },
        select: {
          amount: true,
          expense_date: true
        }
      });

      const todayExpenses = expenses.filter(e => 
        e.expense_date >= today && e.expense_date < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      );
      const weekExpenses = expenses.filter(e => e.expense_date >= startOfWeek);
      const monthExpenses = expenses.filter(e => e.expense_date >= startOfMonth);

      return {
        today: {
          total: todayExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: todayExpenses.length
        },
        week: {
          total: weekExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: weekExpenses.length
        },
        month: {
          total: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: monthExpenses.length
        },
        total: {
          total: expenses.reduce((sum, e) => sum + e.amount, 0),
          count: expenses.length
        }
      };
    } catch (error) {
      throw new Error(`Error getting dashboard summary: ${error.message}`);
    }
  }
}

module.exports = new DashboardModel();