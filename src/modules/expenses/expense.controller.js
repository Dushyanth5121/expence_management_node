// modules/expenses/expense.controller.js
const ExpenseService = require('./expense.service');
const { catchAsync } = require('../../shared/utils/helpers');

class ExpenseController {
  /**
   * Create a new expense
   */
  createExpense = catchAsync(async (req, res) => {
    const expense = await ExpenseService.createExpense(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  });

  /**
   * Get all expenses
   */
  getExpenses = catchAsync(async (req, res) => {
    const {
      search,
      category_id,
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
      category_id,
      payment_method,
      start_date,
      end_date,
      min_amount,
      max_amount,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
      orderBy: orderBy || 'desc'
    };

    const result = await ExpenseService.getExpenses(req.user.id, filters);
    res.json({
      success: true,
      data: result.expenses,
      pagination: result.pagination
    });
  });

  /**
   * Get a single expense
   */
  getExpense = catchAsync(async (req, res) => {
    const expense = await ExpenseService.getExpenseById(req.user.id, req.params.id);
    res.json({
      success: true,
      data: expense
    });
  });

  /**
   * Update an expense
   */
  updateExpense = catchAsync(async (req, res) => {
    const expense = await ExpenseService.updateExpense(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  });

  /**
   * Delete an expense
   */
  deleteExpense = catchAsync(async (req, res) => {
    await ExpenseService.deleteExpense(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  });

  /**
   * Get expense statistics
   */
  getExpenseStats = catchAsync(async (req, res) => {
    const { start_date, end_date } = req.query;
    const stats = await ExpenseService.getExpenseStats(req.user.id, { start_date, end_date });
    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get monthly expense summary
   */
  getMonthlySummary = catchAsync(async (req, res) => {
    const { year, month } = req.params;
    const summary = await ExpenseService.getMonthlySummary(req.user.id, year, month);
    res.json({
      success: true,
      data: summary
    });
  });
}

module.exports = new ExpenseController();