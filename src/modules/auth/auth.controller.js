// modules/auth/auth.controller.js
const AuthService = require('./auth.service');
const { catchAsync } = require('../../shared/utils/helpers');

class AuthController {
  register = catchAsync(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  getProfile = catchAsync(async (req, res) => {
    const user = await AuthService.getProfile(req.user.id);
    res.json({
      success: true,
      data: user
    });
  });

  updateProfile = catchAsync(async (req, res) => {
    const user = await AuthService.updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  });

  logout = catchAsync(async (req, res) => {
    // Since we're using stateless JWT, logout is handled client-side
    // The client should remove the token from storage
    // This endpoint just acknowledges the logout request
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}

module.exports = new AuthController();