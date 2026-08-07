// modules/search/search.service.js
const SearchModel = require('./search.model');
const { AppError } = require('../../shared/utils/helpers');

class SearchService {
  /**
   * Search expenses with multiple filters
   */
  async searchExpenses(userId, filters = {}) {
    // Validate date range
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      if (start > end) {
        throw new AppError('Start date must be before end date', 400);
      }
    }

    // Validate amount range
    if (filters.min_amount && filters.max_amount) {
      if (parseFloat(filters.min_amount) > parseFloat(filters.max_amount)) {
        throw new AppError('Minimum amount must be less than maximum amount', 400);
      }
    }

    // Validate payment method
    if (filters.payment_method) {
      const validMethods = ['Cash', 'Card', 'UPI', 'BankTransfer', 'Other'];
      if (!validMethods.includes(filters.payment_method)) {
        throw new AppError('Invalid payment method', 400);
      }
    }

    // Set defaults
    const searchFilters = {
      ...filters,
      limit: filters.limit ? parseInt(filters.limit) : 100,
      offset: filters.offset ? parseInt(filters.offset) : 0,
      orderBy: filters.orderBy || 'desc'
    };

    const result = await SearchModel.searchExpenses(userId, searchFilters);
    
    return {
      expenses: result.expenses,
      pagination: {
        total: result.total,
        limit: searchFilters.limit,
        offset: searchFilters.offset,
        current_page: Math.floor(searchFilters.offset / searchFilters.limit) + 1,
        total_pages: Math.ceil(result.total / searchFilters.limit)
      },
      filters_applied: {
        title: filters.title || null,
        category_id: filters.category_id || null,
        category_name: filters.category_name || null,
        payment_method: filters.payment_method || null,
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        min_amount: filters.min_amount || null,
        max_amount: filters.max_amount || null,
        search: filters.search || null
      }
    };
  }
}

module.exports = new SearchService();