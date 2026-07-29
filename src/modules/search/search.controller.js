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

//   /**
//    * Get filter options
//    */
//   getFilterOptions = catchAsync(async (req, res) => {
//     const options = await SearchService.getFilterOptions(req.user.id);
    
//     res.json({
//       success: true,
//       data: options
//     });
//   });

//   /**
//    * Get summary for filtered results
//    */
//   getFilteredSummary = catchAsync(async (req, res) => {
//     const {
//       search,
//       title,
//       category_id,
//       payment_method,
//       start_date,
//       end_date,
//       min_amount,
//       max_amount
//     } = req.query;

//     const filters = {
//       search,
//       title,
//       category_id,
//       payment_method,
//       start_date,
//       end_date,
//       min_amount,
//       max_amount
//     };

//     const summary = await SearchService.getFilteredSummary(req.user.id, filters);
    
//     res.json({
//       success: true,
//       data: summary
//     });
//   });

//   /**
//    * Get search suggestions (autocomplete)
//    */
//   getSearchSuggestions = catchAsync(async (req, res) => {
//     const { query } = req.query;
//     const suggestions = await SearchService.getSearchSuggestions(req.user.id, query);
    
//     res.json({
//       success: true,
//       data: suggestions
//     });
//   });

//   /**
//    * Advanced search with multiple criteria
//    */
//   advancedSearch = catchAsync(async (req, res) => {
//     const {
//       search,
//       title,
//       description,
//       category_id,
//       category_name,
//       payment_method,
//       start_date,
//       end_date,
//       min_amount,
//       max_amount,
//       limit,
//       offset,
//       orderBy,
//       groupBy
//     } = req.query;

//     const filters = {
//       search,
//       title,
//       description,
//       category_id,
//       category_name,
//       payment_method,
//       start_date,
//       end_date,
//       min_amount,
//       max_amount,
//       limit,
//       offset,
//       orderBy
//     };

//     // Get filtered results
//     const result = await SearchService.searchExpenses(req.user.id, filters);

//     // Get summary if requested
//     let summary = null;
//     if (groupBy === 'true') {
//       summary = await SearchService.getFilteredSummary(req.user.id, filters);
//     }

//     res.json({
//       success: true,
//       data: result.expenses,
//       summary: summary,
//       pagination: result.pagination,
//       filters_applied: result.filters_applied
//     });
//   });
}

module.exports = new SearchController();