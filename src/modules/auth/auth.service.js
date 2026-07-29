// modules/auth/auth.service.js
const AuthModel = require('./auth.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../shared/utils/helpers');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400);
    }

    // Check if user exists
    const exists = await AuthModel.userExists(email);
    if (exists) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - Note: Prisma schema uses first_name and last_name (with underscores)
    const user = await AuthModel.createUser({
      email: email.trim().toLowerCase(),
      password_hash: hashedPassword,
      first_name: firstName.trim(),
      last_name: lastName.trim()
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async login(email, password) {
    // Find user with password
    const user = await AuthModel.findByEmail(email.trim().toLowerCase());
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Update last login
    await AuthModel.updateLastLogin(user.id);

    const tokens = this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  async getProfile(userId) {
    const user = await AuthModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const safeUpdateData = {};
    
    // Handle fields - updateProfile validation uses first_name and last_name (with underscores)
    if (updateData.first_name !== undefined) {
      safeUpdateData.first_name = updateData.first_name.trim();
    }
    if (updateData.last_name !== undefined) {
      safeUpdateData.last_name = updateData.last_name.trim();
    }
    if (updateData.email !== undefined) {
      safeUpdateData.email = updateData.email.trim().toLowerCase();
    }

    // If email is being changed, check if it already exists
    if (safeUpdateData.email) {
      const existingUser = await AuthModel.findByEmail(safeUpdateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email already in use by another account', 400);
      }
    }

    // If no fields to update, throw error
    if (Object.keys(safeUpdateData).length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    const user = await AuthModel.updateUser(userId, safeUpdateData);
    return this.sanitizeUser(user);
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();