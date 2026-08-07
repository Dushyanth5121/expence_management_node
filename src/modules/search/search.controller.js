// modules/search/search.controller.js
const SearchService = require('./search.service');
const { catchAsync } = require('../../shared/utils/helpers');

class SearchController {
  /**
   * Search expenses with filters
   */
  searchExpenses = catchAsync(async (req, res) => {
    const {
      search,
      title,
      description,
      category_id,
      category_name,
      payment_method,
      start_date,
      end_date,
      min_amount,
      max_amount,
      limit,
      offset,
      orderBy
    } = req.query;

    const filters = {
      search,
      title,
      description,
      category_id,
      category_name,
      payment_method,
      start_date,
      end_date,
      min_amount,
      max_amount,
      limit,
      offset,
      orderBy
    };

    const result = await SearchService.searchExpenses(req.user.id, filters);
    
    res.json({
      success: true,
      data: result.expenses,
      pagination: result.pagination,
      filters_applied: result.filters_applied
    });
  });

}

module.exports = new SearchController();