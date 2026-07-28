const AuthModel = require('./auth.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError } = require('../../shared/utils/helpers');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user exists
    const exists = await AuthModel.userExists(email);
    if (exists) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await AuthModel.createUser({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName
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
    const user = await AuthModel.findByEmail(email);
    
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
    // Remove sensitive fields
    const { password_hash, id, ...safeUpdateData } = updateData;
    
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