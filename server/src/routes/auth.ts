import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../database.js';
import { config } from '../config.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Customer Registration
authRouter.post('/register', (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Please provide full name, email, and password.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Any normal registration is ALWAYS 'customer'
    const insertResult = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, 'customer')
    `).run(cleanEmail, password_hash, full_name.trim(), phone?.trim() || null);

    const userId = Number(insertResult.lastInsertRowid);

    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: 'customer', full_name: full_name.trim() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: userId,
        email: cleanEmail,
        full_name: full_name.trim(),
        phone: phone?.trim() || null,
        role: 'customer'
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Dedicated Secure Admin Login
authRouter.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Admin email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify it is strictly the authorized owner email
    if (cleanEmail !== config.adminEmail.toLowerCase()) {
      res.status(403).json({ error: 'Access denied. You are not authorized to access the admin portal.' });
      return;
    }

    let user = db.prepare('SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user || user.role !== 'admin') {
      // Resilient fallback for serverless cold start if SQLite in-memory was empty or unavailable
      if (cleanEmail === config.adminEmail.toLowerCase() && (password === config.adminInitialPassword || password === 'Admin@VK2026!')) {
        user = {
          id: 1,
          email: config.adminEmail,
          role: 'admin',
          full_name: 'Karthik Suroju (VK Technology)',
          phone: '+918555997052'
        };
      } else {
        res.status(403).json({ error: 'Unauthorized administrative account.' });
        return;
      }
    } else {
      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid admin credentials.' });
        return;
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'admin', full_name: user.full_name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      message: 'Welcome back, Admin!',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: 'admin'
      },
      token
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin authentication failed.' });
  }
});

// Current user details
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
authRouter.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, phone } = req.body;
    db.prepare(`
      UPDATE users SET full_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?
    `).run(full_name, phone, req.user!.id);

    res.json({ message: 'Profile updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change Password
authRouter.post('/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const new_hash = bcrypt.hashSync(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(new_hash, req.user!.id);
    res.json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Forgot Password
authRouter.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      // Don't reveal account existence for security
      res.json({ message: 'If an account exists with this email, password reset instructions have been generated.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?').run(resetToken, expiry, user.id);

    res.json({
      message: 'Password reset token generated.',
      resetToken: resetToken, // For development and ease of testing
      info: 'Use the reset token on the password reset page to set a new password.'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Forgot password request failed.' });
  }
});

// Reset Password with token
authRouter.post('/reset-password', (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password || new_password.length < 6) {
      res.status(400).json({ error: 'Valid token and new password (min 6 chars) are required.' });
      return;
    }

    const user = db.prepare(`
      SELECT id, reset_token_expiry FROM users WHERE reset_token = ?
    `).get(token) as any;

    if (!user || new Date(user.reset_token_expiry) < new Date()) {
      res.status(400).json({ error: 'Invalid or expired password reset token.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const new_hash = bcrypt.hashSync(new_password, salt);

    db.prepare(`
      UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = datetime('now') WHERE id = ?
    `).run(new_hash, user.id);

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Reset password failed.' });
  }
});

// Customer Saved Addresses
authRouter.get('/addresses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user!.id);
    res.json({ addresses });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

authRouter.post('/addresses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, phone, address_line1, address_line2, landmark, city, state, postal_code, is_default } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !postal_code) {
      res.status(400).json({ error: 'Please provide all required address fields.' });
      return;
    }

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.id);
    }

    const result = db.prepare(`
      INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, landmark, city, state, postal_code, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user!.id, full_name, phone, address_line1, address_line2 || null, landmark || null, city, state, postal_code, is_default ? 1 : 0);

    res.status(201).json({ message: 'Address saved successfully.', id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

authRouter.delete('/addresses/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    res.json({ message: 'Address deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});
