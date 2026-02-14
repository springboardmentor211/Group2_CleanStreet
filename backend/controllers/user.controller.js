const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require('../config/db');

/* =========================
   REGISTER USER
========================= */
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let conn;
  try {
    conn = await getConnection();

    const existingUser = await conn.execute(
      'SELECT user_id FROM users WHERE email = :email',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ IMPORTANT CHANGE: role = 'user'
    await conn.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (:name, :email, :password, 'user')`,
      [name, email, hashedPassword],
      { autoCommit: true }
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};


/* =========================
   LOGIN USER (JWT)
========================= */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT user_id, name, email, password, role 
       FROM users WHERE email = :email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        userId: user.USER_ID,
        role: user.ROLE
      },
      'secretkey',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.USER_ID,
        name: user.NAME,
        email: user.EMAIL,
        role: user.ROLE
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};
