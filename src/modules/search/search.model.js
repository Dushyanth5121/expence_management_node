// modules/search/search.model.js
const prisma = require('../../shared/config/prisma');

class SearchModel {
  /**
   * Advanced search for expenses with multiple filters
   */
  async searchExpenses(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      // 1. Search by title (partial match, case insensitive)
      if (filters.title) {
        where.title = {
          contains: filters.title,
          mode: 'insensitive'
        };
      }

      // 2. Filter by category
      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      // 3. Filter by category name
      if (filters.category_name) {
        where.category = {
          name: {
            contains: filters.category_name,
            mode: 'insensitive'
          }
        };
      }

      // 4. Filter by payment method
      if (filters.payment_method) {
        where.payment_method = filters.payment_method;
      }

      // 5. Filter by date range
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

      // 6. Filter by amount range
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

      // 7. Search in description (optional)
      if (filters.description) {
        where.description = {
          contains: filters.description,
          mode: 'insensitive'
        };
      }

      // 8. Combined search in title and description
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Get total count for pagination
      const total = await prisma.expense.count({ where });

      // Get expenses with all filters applied
      const expenses = await prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
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
      throw new Error(`Error searching expenses: ${error.message}`);
    }
  }

  /**
   * Get unique filter options (for dropdowns)
   */
  async getFilterOptions(userId) {
    try {
      // Get all categories for the user
      const categories = await prisma.category.findMany({
        where: {
          user_id: userId,
          is_active: true
        },
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Get all payment methods used by the user
      const paymentMethods = await prisma.expense.groupBy({
        by: ['payment_method'],
        where: {
          user_id: userId
        },
        _count: true
      });

      // Get date range of expenses
      const dateRange = await prisma.expense.aggregate({
        where: {
          user_id: userId
        },
        _min: {
          expense_date: true
        },
        _max: {
          expense_date: true
        }
      });

      // Get amount range
      const amountRange = await prisma.expense.aggregate({
        where: {
          user_id: userId
        },
        _min: {
          amount: true
        },
        _max: {
          amount: true
        },
        _avg: {
          amount: true
        }
      });

      return {
        categories,
        payment_methods: paymentMethods.map(pm => ({
          method: pm.payment_method,
          count: pm._count
        })),
        date_range: {
          min_date: dateRange._min.expense_date,
          max_date: dateRange._max.expense_date
        },
        amount_range: {
          min_amount: amountRange._min.amount || 0,
          max_amount: amountRange._max.amount || 0,
          avg_amount: amountRange._avg.amount || 0
        }
      };
    } catch (error) {
      throw new Error(`Error getting filter options: ${error.message}`);
    }
  }

  /**
   * Get expense summary for filtered results
   */
  async getFilteredSummary(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      // Apply same filters as search
      if (filters.title) {
        where.title = {
          contains: filters.title,
          mode: 'insensitive'
        };
      }

      if (filters.category_id) {
        where.category_id = filters.category_id;
      }

      if (filters.payment_method) {
        where.payment_method = filters.payment_method;
      }

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

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Get summary statistics
      const summary = await prisma.expense.aggregate({
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

      // Get expenses by category for the filtered results
      const categoryBreakdown = await prisma.expense.groupBy({
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
      const categoryIds = categoryBreakdown.map(item => item.category_id);
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

      const categoryStats = categoryBreakdown.map(item => ({
        category_id: item.category_id,
        category_name: categoryMap[item.category_id] || 'Unknown',
        count: item._count,
        total_amount: item._sum.amount || 0
      }));

      // Get expenses by payment method for filtered results
      const paymentBreakdown = await prisma.expense.groupBy({
        by: ['payment_method'],
        where,
        _count: true,
        _sum: {
          amount: true
        }
      });

      return {
        total_count: summary._count || 0,
        total_amount: summary._sum.amount || 0,
        average_amount: summary._avg.amount || 0,
        max_amount: summary._max.amount || 0,
        min_amount: summary._min.amount || 0,
        category_breakdown: categoryStats,
        payment_breakdown: paymentBreakdown.map(item => ({
          method: item.payment_method,
          count: item._count,
          total_amount: item._sum.amount || 0
        }))
      };
    } catch (error) {
      throw new Error(`Error getting filtered summary: ${error.message}`);
    }
  }
}

module.exports = new SearchModel();