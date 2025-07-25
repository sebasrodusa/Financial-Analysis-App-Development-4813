import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  clerkClient,
} from '@clerk/clerk-sdk-node';

const { Pool } = pkg;

dotenv.config();

let pool;
if (process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString:
      process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
}

const app = express();
app.use(express.json());
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : undefined;
app.use(allowedOrigins ? cors({ origin: allowedOrigins }) : cors());
app.use(ClerkExpressWithAuth());
const PORT = process.env.PORT || 3000;

const allowedClientColumns = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip_code',
  'date_of_birth',
  'occupation',
  'employer',
  'marital_status',
  'spouse_first_name',
  'spouse_last_name',
  'spouse_date_of_birth',
  'spouse_occupation',
  'spouse_employer',
  'spouse_phone',
  'spouse_email',
  'children',
];

const allowedAnalysisColumns = [
  'income',
  'expenses',
  'assets',
  'liabilities',
  'financial_goals',
  'life_insurance',
  'net_income',
  'net_worth',
];

async function getOrCreateUserByClerkId(clerkId) {
  const { rows } = await pool.query(
    'SELECT id FROM users_pt2024 WHERE clerk_id=$1',
    [clerkId]
  );
  if (rows.length) return rows[0].id;

  let firstName = 'First';
  let lastName = 'Last';
  let email = null;
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    firstName = clerkUser.firstName || firstName;
    lastName = clerkUser.lastName || lastName;
    email =
      (clerkUser.emailAddresses &&
        clerkUser.emailAddresses[0] &&
        clerkUser.emailAddresses[0].emailAddress) ||
      null;
  } catch (err) {
    console.error('Clerk API error:', err);
  }

  const hash = await bcrypt.hash('placeholder', 10);
  const { rows: inserted } = await pool.query(
    `INSERT INTO users_pt2024 (email, clerk_id, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, 'financial_professional')
     RETURNING id`,
    [email, clerkId, hash, firstName, lastName]
  );
  return inserted[0].id;
}

// Authentication
app.post('/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users_pt2024 (email, password_hash, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,'financial_professional') RETURNING id,email,first_name,last_name,role`,
      [email, hash, firstName, lastName]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'signup failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users_pt2024 WHERE email=$1',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const { password_hash, ...rest } = user;
    res.json({ user: rest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'login failed' });
  }
});

// Users CRUD
app.use('/users', ClerkExpressRequireAuth());
app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, clerk_id, email, first_name, last_name, role, is_active FROM users_pt2024'
    );
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/users', async (req, res) => {
  const { email, password, firstName, lastName, role, clerkId } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users_pt2024 (email, clerk_id, password_hash, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, clerk_id, email, first_name, last_name, role, is_active`,
      [email, clerkId, hash, firstName, lastName, role]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create failed' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive, clerkId } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users_pt2024 SET first_name=$1,last_name=$2,role=$3,is_active=$4,clerk_id=$5,updated_at=NOW()
       WHERE id=$6 RETURNING id, clerk_id, email, first_name, last_name, role, is_active`,
      [firstName, lastName, role, isActive, clerkId, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'update failed' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users_pt2024 WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'delete failed' });
  }
});

// Clients CRUD
app.use('/clients', ClerkExpressRequireAuth());
app.get('/clients', async (req, res) => {
  try {
    const dbUserId = await getOrCreateUserByClerkId(req.auth.userId);
    const { rows } = await pool.query('SELECT * FROM clients WHERE user_id=$1', [dbUserId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/clients', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    zip_code,
    date_of_birth,
    occupation,
    employer,
    marital_status,
    spouse_first_name,
    spouse_last_name,
    spouse_date_of_birth,
    spouse_occupation,
    spouse_employer,
    spouse_phone,
    spouse_email,
    children,
  } = req.body;
  try {
    const dbUserId = await getOrCreateUserByClerkId(req.auth.userId);
    const { rows } = await pool.query(
      `INSERT INTO clients (user_id,first_name,last_name,email,phone,address,city,state,zip_code,date_of_birth,occupation,employer,marital_status,spouse_first_name,spouse_last_name,spouse_date_of_birth,spouse_occupation,spouse_employer,spouse_phone,spouse_email,children)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING *`,
      [
        dbUserId,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        date_of_birth,
        occupation,
        employer,
        marital_status,
        spouse_first_name,
        spouse_last_name,
        spouse_date_of_birth,
        spouse_occupation,
        spouse_employer,
        spouse_phone,
        spouse_email,
        children,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create failed' });
  }
});

app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  const invalid = keys.filter((k) => !allowedClientColumns.includes(k));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid fields: ${invalid.join(', ')}` });
  }
  const values = Object.values(fields);
  const set = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `UPDATE clients SET ${set}, updated_at=NOW() WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'update failed' });
  }
});

app.delete('/clients/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'delete failed' });
  }
});

// Analyses CRUD
app.use('/analyses', ClerkExpressRequireAuth());
app.get('/analyses', async (req, res) => {
  try {
    const dbUserId = await getOrCreateUserByClerkId(req.auth.userId);
    const { rows } = await pool.query(
      `SELECT fa.* FROM financial_analyses fa
       JOIN clients c ON fa.client_id = c.id
       WHERE c.user_id = $1`,
      [dbUserId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/analyses', async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const cols = keys.join(',');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  try {
    const { rows } = await pool.query(
      `INSERT INTO financial_analyses (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create failed' });
  }
});

app.put('/analyses/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  const invalid = keys.filter((k) => !allowedAnalysisColumns.includes(k));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid fields: ${invalid.join(', ')}` });
  }
  const values = Object.values(fields);
  const set = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  try {
    const { rows } = await pool.query(
      `UPDATE financial_analyses SET ${set}, updated_at=NOW() WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'update failed' });
  }
});

app.delete('/analyses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM financial_analyses WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
