// modules/categories/category.service.js
const CategoryModel = require('./category.model');
const { AppError } = require('../../shared/utils/helpers');

class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(userId, data) {
    const { name, description } = data;

    // Check if category already exists for this user
    const exists = await CategoryModel.categoryExists(name, userId);
    if (exists) {
      throw new AppError('Category with this name already exists', 400);
    }

    // Create category
    const category = await CategoryModel.createCategory({
      name: name.trim(),
      description: description ? description.trim() : null,
      user_id: userId
    });

    return category;
  }

  /**
   * Get all categories for a user
   */
  async getCategories(userId, filters = {}) {
    const categories = await CategoryModel.getCategories(userId, filters);
    const total = await CategoryModel.getCategoryCount(userId, filters);

    return {
      categories,
      total,
      limit: filters.limit || 100,
      offset: filters.offset || 0
    };
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(userId, categoryId) {
    const category = await CategoryModel.findById(categoryId, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  /**
   * Update a category
   */
  async updateCategory(userId, categoryId, data) {
    const { name, description, is_active } = data;

    // Check if category exists
    const category = await CategoryModel.findById(categoryId, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== category.name) {
      const exists = await CategoryModel.categoryExists(name, userId, categoryId);
      if (exists) {
        throw new AppError('Category with this name already exists', 400);
      }
    }

    // Update category
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (is_active !== undefined) updateData.is_active = is_active;

    await CategoryModel.updateCategory(categoryId, userId, updateData);

    // Get updated category
    return await CategoryModel.findById(categoryId, userId);
  }

  /**
   * Delete a category (soft delete)
   */
  async deleteCategory(userId, categoryId) {
    // Check if category exists
    const category = await CategoryModel.findById(categoryId, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category is being used in expenses
    // You can add this check if you have an Expense model
    // const hasExpenses = await ExpenseModel.hasCategoryExpenses(categoryId);
    // if (hasExpenses) {
    //   throw new AppError('Cannot delete category with existing expenses', 400);
    // }

    await CategoryModel.deleteCategory(categoryId, userId);
    return true;
  }

  /**
   * Permanently delete a category
   */
  async permanentDeleteCategory(userId, categoryId) {
    // Check if category exists
    const category = await CategoryModel.findById(categoryId, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await CategoryModel.permanentDeleteCategory(categoryId, userId);
    return true;
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(userId) {
    const categories = await CategoryModel.getCategories(userId, { is_active: true });
    
    return {
      total: categories.length,
      active: categories.filter(c => c.is_active).length,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description
      }))
    };
  }
}

module.exports = new CategoryService();