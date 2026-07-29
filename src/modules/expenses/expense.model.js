// modules/expenses/expense.model.js
const prisma = require('../../shared/config/prisma');

class ExpenseModel {
  /**
   * Create a new expense
   */
  async createExpense(data) {
    try {
      return await prisma.expense.create({
        data: {
          title: data.title,
          amount: data.amount,
          category_id: data.category_id,
          expense_date: data.expense_date || new Date(),
          payment_method: data.payment_method,
          description: data.description,
          user_id: data.user_id
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Error creating expense: ${error.message}`);
    }
  }

  /**
   * Find expense by ID
   */
  async findById(id, userId) {
    try {
      return await prisma.expense.findFirst({
        where: {
          id,
          user_id: userId
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Error finding expense: ${error.message}`);
    }
  }

  /**
   * Get all expenses for a user with filters
   */
  async getExpenses(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      // Filter by category
      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      // Filter by payment method
      if (filters.payment_method) {
        where.payment_method = filters.payment_method;
      }

      // Filter by date range
      if (filters.start_date) {
        where.expense_date = {
          ...where.expense_date,
          gte: new Date(filters.start_date)
        };
      }

      if (filters.end_date) {
        where.expense_date = {
          ...where.expense_date,
          lte: new Date(filters.end_date)
        };
      }

      // Search by title or description
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Amount range
      if (filters.min_amount) {
        where.amount = {
          ...where.amount,
          gte: parseFloat(filters.min_amount)
        };
      }

      if (filters.max_amount) {
        where.amount = {
          ...where.amount,
          lte: parseFloat(filters.max_amount)
        };
      }

      // Get total count for pagination
      const total = await prisma.expense.count({ where });

      // Get expenses with pagination and sorting
      const expenses = await prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          expense_date: filters.orderBy === 'asc' ? 'asc' : 'desc'
        },
        skip: filters.offset || 0,
        take: filters.limit || 100
      });

      return { expenses, total };
    } catch (error) {
      throw new Error(`Error fetching expenses: ${error.message}`);
    }
  }

  /**
   * Update an expense
   */
  async updateExpense(id, userId, data) {
    try {
      return await prisma.expense.updateMany({
        where: {
          id,
          user_id: userId
        },
        data: {
          title: data.title,
          amount: data.amount,
          category_id: data.category_id,
          expense_date: data.expense_date,
          payment_method: data.payment_method,
          description: data.description,
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error updating expense: ${error.message}`);
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id, userId) {
    try {
      return await prisma.expense.deleteMany({
        where: {
          id,
          user_id: userId
        }
      });
    } catch (error) {
      throw new Error(`Error deleting expense: ${error.message}`);
    }
  }

  /**
   * Get expense summary statistics
   */
  async getExpenseStats(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      if (filters.start_date) {
        where.expense_date = {
          ...where.expense_date,
          gte: new Date(filters.start_date)
        };
      }

      if (filters.end_date) {
        where.expense_date = {
          ...where.expense_date,
          lte: new Date(filters.end_date)
        };
      }

      // Total expenses
      const totalExpenses = await prisma.expense.aggregate({
        where,
        _count: true,
        _sum: {
          amount: true
        },
        _avg: {
          amount: true
        },
        _max: {
          amount: true
        },
        _min: {
          amount: true
        }
      });

      // Expenses by category
      const expensesByCategory = await prisma.expense.groupBy({
        by: ['category_id'],
        where,
        _count: true,
        _sum: {
          amount: true
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        }
      });

      // Get category names
      const categoryIds = expensesByCategory.map(item => item.category_id);
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds }
        },
        select: {
          id: true,
          name: true
        }
      });

      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });

      const categoryStats = expensesByCategory.map(item => ({
        category_id: item.category_id,
        category_name: categoryMap[item.category_id] || 'Unknown',
        count: item._count,
        total_amount: item._sum.amount || 0
      }));

      // Expenses by payment method
      const expensesByPayment = await prisma.expense.groupBy({
        by: ['payment_method'],
        where,
        _count: true,
        _sum: {
          amount: true
        }
      });

      return {
        total: {
          count: totalExpenses._count || 0,
          total_amount: totalExpenses._sum.amount || 0,
          average_amount: totalExpenses._avg.amount || 0,
          max_amount: totalExpenses._max.amount || 0,
          min_amount: totalExpenses._min.amount || 0
        },
        by_category: categoryStats,
        by_payment_method: expensesByPayment.map(item => ({
          method: item.payment_method,
          count: item._count,
          total_amount: item._sum.amount || 0
        }))
      };
    } catch (error) {
      throw new Error(`Error getting expense stats: ${error.message}`);
    }
  }

  /**
   * Get monthly expense summary
   */
  async getMonthlySummary(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const expenses = await prisma.expense.findMany({
        where: {
          user_id: userId,
          expense_date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          expense_date: 'asc'
        }
      });

      // Daily summary
      const dailySummary = {};
      expenses.forEach(expense => {
        const date = expense.expense_date.toISOString().split('T')[0];
        if (!dailySummary[date]) {
          dailySummary[date] = {
            date,
            total: 0,
            count: 0,
            expenses: []
          };
        }
        dailySummary[date].total += expense.amount;
        dailySummary[date].count += 1;
        dailySummary[date].expenses.push(expense);
      });

      return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        total_expenses: expenses.length,
        total_amount: expenses.reduce((sum, e) => sum + e.amount, 0),
        daily_summary: Object.values(dailySummary)
      };
    } catch (error) {
      throw new Error(`Error getting monthly summary: ${error.message}`);
    }
  }
}

module.exports = new ExpenseModel();