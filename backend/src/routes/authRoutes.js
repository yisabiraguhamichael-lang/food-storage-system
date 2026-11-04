import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return process.env.JWT_SECRET;
}

router.post('/register', async (req, res) => {
  const { fullName, email, password, contact } = req.body || {};
  const cleanName = typeof fullName === 'string' ? fullName.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanContact = typeof contact === 'string' ? contact.trim() : '';

  if (req.body?.role === 'admin') {
    return res.status(403).json({ message: 'Admin accounts must be created by the system administrator.' });
  }
  if (cleanName.length < 2 || cleanName.length > 150) {
    return res.status(400).json({ message: 'Full name must be between 2 and 150 characters.' });
  }
  if (cleanEmail.length > 254 || !emailPattern.test(cleanEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  }
  if (cleanContact.length < 3 || cleanContact.length > 40) {
    return res.status(400).json({ message: 'Contact must be between 3 and 40 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, contact, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, full_name, email, contact, role`,
      [cleanName, cleanEmail, passwordHash, cleanContact],
    );
    const user = rows[0];
    return res.status(201).json({
      message: 'Account saved. You can now log in.',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Account registration failed:', error.message);
    return res.status(500).json({ message: 'Could not save your account. Please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!emailPattern.test(cleanEmail) || typeof password !== 'string' || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ message: 'Enter a valid email, password, and account type.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, contact, role, password_hash FROM users WHERE email = $1',
      [cleanEmail],
    );
    const user = rows[0];
    if (!user || user.role !== role || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Email, password, or account type is incorrect.' });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      getJwtSecret(),
      { subject: String(user.id), expiresIn: '8h' },
    );
    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Account login failed:', error.message);
    return res.status(500).json({ message: 'Could not log in. Please try again later.' });
  }
});

export default router;