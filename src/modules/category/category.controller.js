// modules/categories/category.controller.js
const CategoryService = require('./category.service');
const { catchAsync } = require('../../shared/utils/helpers');

class CategoryController {
  /**
   * Create a new category
   */
  createCategory = catchAsync(async (req, res) => {
    const category = await CategoryService.createCategory(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  });

  /**
   * Get all categories
   */
  getCategories = catchAsync(async (req, res) => {
    const { search, is_active, limit, offset } = req.query;
    
    const filters = {
      search,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    };

    const result = await CategoryService.getCategories(req.user.id, filters);
    res.json({
      success: true,
      data: result.categories,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset
      }
    });
  });

  /**
   * Get a single category
   */
  getCategory = catchAsync(async (req, res) => {
    const category = await CategoryService.getCategoryById(req.user.id, req.params.id);
    res.json({
      success: true,
      data: category
    });
  });

  /**
   * Update a category
   */
  updateCategory = catchAsync(async (req, res) => {
    const category = await CategoryService.updateCategory(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  });

  /**
   * Delete a category (soft delete)
   */
  deleteCategory = catchAsync(async (req, res) => {
    await CategoryService.deleteCategory(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  });

  /**
   * Permanently delete a category
   */
  permanentDeleteCategory = catchAsync(async (req, res) => {
    await CategoryService.permanentDeleteCategory(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Category permanently deleted successfully'
    });
  });

  /**
   * Get category statistics
   */
  getCategoryStats = catchAsync(async (req, res) => {
    const stats = await CategoryService.getCategoryStats(req.user.id);
    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new CategoryController();