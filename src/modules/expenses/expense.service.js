// modules/expenses/expense.service.js
const ExpenseModel = require('./expense.model');
const { AppError } = require('../../shared/utils/helpers');
const CategoryModel = require('../category/category.model');
class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(userId, data) {
    const { title, amount, category_id, expense_date, payment_method, description } = data;

    // Validate amount
    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    // Check if category exists and belongs to user
    const category = await CategoryModel.findById(category_id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (!category.is_active) {
      throw new AppError('Category is deactivated', 400);
    }

    // Create expense
    const expense = await ExpenseModel.createExpense({
      title: title.trim(),
      amount,
      category_id,
      expense_date: expense_date ? new Date(expense_date) : new Date(),
      payment_method,
      description: description ? description.trim() : null,
      user_id: userId
    });

    return expense;
  }

  /**
   * Get all expenses for a user
   */
  async getExpenses(userId, filters = {}) {
    // Validate date range
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      if (start > end) {
        throw new AppError('Start date must be before end date', 400);
      }
    }

    const result = await ExpenseModel.getExpenses(userId, filters);
    
    return {
      expenses: result.expenses,
      pagination: {
        total: result.total,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      }
    };
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(userId, expenseId) {
    const expense = await ExpenseModel.findById(expenseId, userId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }
    return expense;
  }

  /**
   * Update an expense
   */
  async updateExpense(userId, expenseId, data) {
    // Check if expense exists
    const expense = await ExpenseModel.findById(expenseId, userId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    // Validate amount if provided
    if (data.amount && data.amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    // Check if category exists and belongs to user (if category is being updated)
    if (data.category_id) {
      const category = await CategoryModel.findById(data.category_id, userId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      if (!category.is_active) {
        throw new AppError('Category is deactivated', 400);
      }
    }

    // Update expense
    const updateData = {};
    if (data.title) updateData.title = data.title.trim();
    if (data.amount) updateData.amount = data.amount;
    if (data.category_id) updateData.category_id = data.category_id;
    if (data.expense_date) updateData.expense_date = new Date(data.expense_date);
    if (data.payment_method) updateData.payment_method = data.payment_method;
    if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : null;

    await ExpenseModel.updateExpense(expenseId, userId, updateData);

    // Get updated expense
    return await ExpenseModel.findById(expenseId, userId);
  }

  /**
   * Delete an expense
   */
  async deleteExpense(userId, expenseId) {
    // Check if expense exists
    const expense = await ExpenseModel.findById(expenseId, userId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    await ExpenseModel.deleteExpense(expenseId, userId);
    return true;
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(userId, filters = {}) {
    // Validate date range
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      if (start > end) {
        throw new AppError('Start date must be before end date', 400);
      }
    }

    return await ExpenseModel.getExpenseStats(userId, filters);
  }

  /**
   * Get monthly expense summary
   */
  async getMonthlySummary(userId, year, month) {
    if (!year || !month) {
      throw new AppError('Year and month are required', 400);
    }

    if (month < 1 || month > 12) {
      throw new AppError('Month must be between 1 and 12', 400);
    }

    return await ExpenseModel.getMonthlySummary(userId, parseInt(year), parseInt(month));
  }
}

module.exports = new ExpenseService();