// backend/server.mjs

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mariadb from './mariadb.js';

const app        = express();
const PORT       = process.env.PORT       || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET in environment');
  process.exit(1);
}

// ——— Middleware ———
app.use(cors({ origin: '*' }));
app.use(express.json());

// Authenticate & attach req.user = { userId, role }
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success:false, message:'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success:false, message:'Invalid token' });
  }
}
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success:false, message:'Admins only' });
  }
  next();
}

// ——— Health ———
app.get('/health', (_req, res) => {
  res.json({ success:true, message:'Server is running' });
});

// ——— Auth ———
// Register
app.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success:false, message:'Name, email & password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await mariadb.execute(
      'INSERT INTO users (name,email,password,phone,role) VALUES (?,?,?,?,?)',
      [name, email, hash, phone || null, 'customer']
    );
    const token = jwt.sign({ userId: result.insertId, role:'customer' }, JWT_SECRET, { expiresIn:'7d' });
    res.status(201).json({ success:true, userId: result.insertId, role:'customer', token });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success:false, message:'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success:false, message:'Email & password required' });
  }
  try {
    const [rows] = await mariadb.execute(
      'SELECT id, password, role FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success:false, message:'Invalid credentials' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success:false, message:'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role:user.role }, JWT_SECRET, { expiresIn:'7d' });
    res.json({ success:true, userId:user.id, role:user.role, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// ——— Restaurants ———
// List
app.get('/restaurants', async (_req, res) => {
  try {
    const [rows] = await mariadb.execute('SELECT id, name, location FROM restaurants');
    res.json({ success:true, data:rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Detail
app.get('/restaurants/:id', async (req, res) => {
  try {
    const [rows] = await mariadb.execute(
      'SELECT id, name, location FROM restaurants WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success:false, message:'Not found' });
    }
    res.json({ success:true, data:rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Create (admin)
app.post('/restaurants', authenticate, requireAdmin, async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ success:false, message:'Name & location required' });
  }
  try {
    const [result] = await mariadb.execute(
      'INSERT INTO restaurants (name, location) VALUES (?, ?)',
      [name, location]
    );
    res.status(201).json({ success:true, restaurantId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Delete (admin)
app.delete('/restaurants/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const [result] = await mariadb.execute(
      'DELETE FROM restaurants WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success:false, message:'Not found' });
    }
    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// ——— Reservations ———
// Make reservation (customer)
app.post('/restaurants/:id/reservations', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const { date, time } = req.body;  // expecting { date: "YYYY-MM-DD", time: "HH:MM" }

  if (!date || !time) {
    return res
      .status(400)
      .json({ success: false, message: 'Both date and time are required.' });
  }

  // Combine into a single MySQL DATETIME string: "YYYY-MM-DD HH:MM:00"
  const reservationTime = `${date} ${time}:00`;

  try {
    const [result] = await mariadb.execute(
      `INSERT INTO reservations 
         (user_id, restaurant_id, reservation_time) 
       VALUES ( ?, ?, ? )`,
      [ userId, req.params.id, reservationTime ]
    );

    return res
      .status(201)
      .json({ success: true, reservationId: result.insertId });
  } catch (err) {
    console.error('Reservation insert error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
});

// List user’s reservations
app.get('/users/me/reservations', authenticate, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [rows] = await mariadb.execute(
      `SELECT r.id, r.date, r.time,
              res.name   AS restaurantName,
              res.location AS restaurantLocation
       FROM reservations r
       JOIN restaurants res ON res.id = r.restaurant_id
       WHERE r.user_id = ?
       ORDER BY r.date DESC, r.time DESC`,
      [userId]
    );
    res.json({ success:true, data:rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Cancel reservation
app.delete('/reservations/:id', authenticate, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [result] = await mariadb.execute(
      'DELETE FROM reservations WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success:false, message:'Not found or unauthorized' });
    }
    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// ——— Start ———
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
