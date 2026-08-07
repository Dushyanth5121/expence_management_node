// modules/search/search.model.js
const prisma = require('../../shared/config/prisma');

class SearchModel {
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
}

module.exports = new SearchModel();