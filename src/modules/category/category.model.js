// modules/categories/category.model.js
const prisma = require('../../shared/config/prisma');

class CategoryModel {
  /**
   * Create a new category
   */
  async createCategory(data) {
    try {
      return await prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
          user_id: data.user_id,
          is_active: data.is_active !== undefined ? data.is_active : true
        }
      });
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  /**
   * Find category by ID
   */
  async findById(id, userId) {
    try {
      return await prisma.category.findFirst({
        where: {
          id,
          user_id: userId
        }
      });
    } catch (error) {
      throw new Error(`Error finding category: ${error.message}`);
    }
  }

  /**
   * Find category by name for a specific user
   */
  async findByName(name, userId) {
    try {
      return await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive' // Case insensitive
          },
          user_id: userId
        }
      });
    } catch (error) {
      throw new Error(`Error finding category by name: ${error.message}`);
    }
  }

  /**
   * Get all categories for a user
   */
  async getCategories(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      return await prisma.category.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip: filters.offset || 0,
        take: filters.limit || 100
      });
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id, userId, data) {
    try {
      return await prisma.category.updateMany({
        where: {
          id,
          user_id: userId
        },
        data: {
          name: data.name,
          description: data.description,
          is_active: data.is_active,
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  /**
   * Delete a category (soft delete by setting is_active to false)
   */
  async deleteCategory(id, userId) {
    try {
      return await prisma.category.updateMany({
        where: {
          id,
          user_id: userId
        },
        data: {
          is_active: false,
          deleted_at: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  /**
   * Permanently delete a category
   */
  async permanentDeleteCategory(id, userId) {
    try {
      return await prisma.category.deleteMany({
        where: {
          id,
          user_id: userId
        }
      });
    } catch (error) {
      throw new Error(`Error permanently deleting category: ${error.message}`);
    }
  }

  /**
   * Check if category exists for a user
   */
  async categoryExists(name, userId, excludeId = null) {
    try {
      const where = {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        user_id: userId
      };

      if (excludeId) {
        where.id = {
          not: excludeId
        };
      }

      const count = await prisma.category.count({ where });
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking category existence: ${error.message}`);
    }
  }

  /**
   * Get category count for a user
   */
  async getCategoryCount(userId, filters = {}) {
    try {
      const where = {
        user_id: userId
      };

      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      return await prisma.category.count({ where });
    } catch (error) {
      throw new Error(`Error counting categories: ${error.message}`);
    }
  }
}

module.exports = new CategoryModel();