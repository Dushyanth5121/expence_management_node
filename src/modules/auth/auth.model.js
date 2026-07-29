// modules/auth/auth.model.js
const prisma = require('../../shared/config/prisma');

class AuthModel {
  /**
   * Find a user by email
   */
  async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find a user by ID
   */
  async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          last_login: true,
          created_at: true,
          updated_at: true
        }
      });
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      return await prisma.user.create({
        data: {
          email: userData.email,
          password_hash: userData.password_hash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'user',
          is_active: userData.is_active !== undefined ? userData.is_active : true
        }
      });
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update a user
   */
  async updateUser(id, updateData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { last_login: new Date() }
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id, newPasswordHash) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { password_hash: newPasswordHash }
      });
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  /**
   * Check if user exists by email
   */
  async userExists(email) {
    try {
      const count = await prisma.user.count({
        where: { email }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking user existence: ${error.message}`);
    }
  }

  /**
   * Get all users with pagination
   */
  async getUsers(filters = {}) {
    try {
      const where = {};
      
      if (filters.role) {
        where.role = filters.role;
      }
      
      if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
      }

      return await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          last_login: true,
          created_at: true,
          updated_at: true
        },
        skip: filters.offset || 0,
        take: filters.limit || 100,
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }
}

module.exports = new AuthModel();