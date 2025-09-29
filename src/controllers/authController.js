const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const db = require('../config/database');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  return { accessToken, refreshToken };
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND isActive = 1',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await db.execute(
      'UPDATE users SET refresh_token = ?, refresh_token_expires = ?, lastLogin = NOW() WHERE id = ?',
      [refreshToken, refreshTokenExpires, user.id]
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const [users] = await db.execute(
      'SELECT * FROM users WHERE refresh_token = ? AND refresh_token_expires > NOW()',
      [refreshToken]
    );

    if (users.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = users[0];
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await db.execute(
      'UPDATE users SET refresh_token = ?, refresh_token_expires = ? WHERE id = ?',
      [newRefreshToken, refreshTokenExpires, user.id]
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await db.execute(
        'UPDATE users SET refresh_token = NULL, refresh_token_expires = NULL WHERE refresh_token = ?',
        [refreshToken]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, email, password, role = 'viewer' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    console.log('User created with ID:', result.insertId);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        username,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
};

module.exports = { login, register, refreshToken, logout };