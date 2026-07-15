import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123_mygo';

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2914',
  database: process.env.DB_NAME || 'mygo_tickets',
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('PostgreSQL connected successfully at', res.rows[0].now);
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.EXTERNAL_API_KEY || 'mygo-external-support-key';

  if (apiKey) {
    if (apiKey === expectedApiKey) {
      req.isApiKey = true;
      return next();
    } else {
      return res.status(403).json({ message: 'Invalid API Key' });
    }
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    req.isApiKey = false;
    next();
  });
};

// Default team mapper based on category
const getAssignedTeam = (category) => {
  const mapping = {
    'Employee Lifecycle': 'HR Operations',
    'IT Operations': 'IT Support',
    'Access Management': 'IT Security',
    'HR & Payroll': 'Payroll',
    'Recruitment': 'HR Operations',
    'Immigration': 'Immigration',
  };
  return mapping[category] || 'IT Support';
};

// Default SLA mapper based on priority
const getSLA = (priority) => {
  const mapping = {
    'Critical': '30m Response / 2h Resolution',
    'High': '1h Response / 4h Resolution',
    'Medium': '2h Response / 8h Resolution',
    'Low': '4h Response / 24h Resolution',
  };
  return mapping[priority] || '4h Response / 24h Resolution';
};

// Map DB ticket to frontend CamelCase TicketData format
const mapTicketToFrontend = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  subcategory: row.subcategory,
  priority: row.priority,
  status: row.status,
  requestorId: row.requestor_id,
  requestor: row.requestor_name,
  assignedTeam: row.assigned_team,
  assigneeId: row.assignee_id,
  assignee: row.assignee_name,
  sla: row.sla,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tenantId: row.tenant_id,
  source: row.source,
  logs: row.logs,
  claimedAt: row.claimed_at,
  inProgressAt: row.in_progress_at,
  pendingAt: row.pending_at,
  resolvedAt: row.resolved_at,
  closedAt: row.closed_at,
});

// --- Auth Endpoints ---

// User sign up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role, department } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (role !== 'Requestor' && role !== 'Agent') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Check if user already exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, department, created_at',
      [email.toLowerCase(), passwordHash, name, role, role === 'Agent' ? department || 'IT Support' : null]
    );

    const user = newUser.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: user.created_at,
      }
    });
  } catch (err) {
    console.error('Error signing up user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User log in
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch current user details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, department, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Ticket Endpoints ---

// Get all tickets (restricted by role)
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT t.*, u.name AS requestor_name, a.name AS assignee_name 
      FROM tickets t 
      LEFT JOIN users u ON t.requestor_id = u.id 
      LEFT JOIN users a ON t.assignee_id = a.id
    `;
    const params = [];

    // If requestor, they only see their raised tickets. If agent, they only see tickets assigned to their department.
    if (req.user.role === 'Requestor') {
      query += ' WHERE t.requestor_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'Agent') {
      // Query the database to get their latest department preference
      const userRes = await pool.query('SELECT department FROM users WHERE id = $1', [req.user.id]);
      if (userRes.rows.length > 0 && userRes.rows[0].department) {
        query += ' WHERE t.assigned_team = $1';
        params.push(userRes.rows[0].department);
      }
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    const tickets = result.rows.map(mapTicketToFrontend);
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new ticket
app.post('/api/tickets', authenticateToken, async (req, res) => {
  const { title, description, category, subcategory, priority, tenantId, source, logs, requestorEmail, requestorName } = req.body;

  if (!title || !category || !subcategory || !priority) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    let requestorId = null;

    if (req.isApiKey) {
      if (!requestorEmail) {
        return res.status(400).json({ message: 'requestorEmail is required when authenticating with an API Key' });
      }

      // Check if user exists by email (case-insensitive)
      const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [requestorEmail.toLowerCase()]);
      if (userCheck.rows.length > 0) {
        requestorId = userCheck.rows[0].id;
      } else {
        // Create a new requestor user on the fly
        const name = requestorName || requestorEmail.split('@')[0];
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const newUser = await pool.query(
          'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [requestorEmail.toLowerCase(), dummyPassword, name, 'Requestor']
        );
        requestorId = newUser.rows[0].id;
      }
    } else {
      // Authenticated via JWT
      requestorId = req.user.id;
    }

    // Generate sequential ticket ID, e.g. TKT-007
    // We can count tickets, but let's query the highest ID to prevent duplicates if any were deleted
    const countResult = await pool.query("SELECT id FROM tickets WHERE id LIKE 'TKT-%' ORDER BY id DESC LIMIT 1");
    let nextNum = 1;
    if (countResult.rows.length > 0) {
      const lastId = countResult.rows[0].id;
      const lastNum = parseInt(lastId.replace('TKT-', ''), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const ticketId = `TKT-${String(nextNum).padStart(3, '0')}`;
    const assignedTeam = getAssignedTeam(category);
    const sla = getSLA(priority);
    const status = 'New';

    let parsedLogs = null;
    if (assignedTeam === 'IT Support' && logs) {
      if (Array.isArray(logs)) {
        parsedLogs = JSON.stringify(logs);
      } else if (typeof logs === 'string') {
        try {
          const parsed = JSON.parse(logs);
          parsedLogs = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([logs]);
        } catch (e) {
          // If not valid JSON string, split by newline and take last 5
          const splitLogs = logs.split('\n').map(l => l.trim()).filter(Boolean);
          parsedLogs = JSON.stringify(splitLogs.slice(0, 5));
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO tickets 
      (id, title, description, category, subcategory, priority, status, requestor_id, assigned_team, assignee_id, sla, tenant_id, source, logs, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10, $11, $12, $13, NOW(), NOW()) 
      RETURNING *`,
      [
        ticketId, 
        title, 
        description || '', 
        category, 
        subcategory, 
        priority, 
        status, 
        requestorId, 
        assignedTeam, 
        sla,
        tenantId || null,
        source || null,
        parsedLogs
      ]
    );

    // Fetch the ticket with requestor name
    const addedRes = await pool.query(
      `SELECT t.*, u.name AS requestor_name, NULL AS assignee_name 
       FROM tickets t 
       LEFT JOIN users u ON t.requestor_id = u.id 
       WHERE t.id = $1`,
      [ticketId]
    );

    res.status(201).json(mapTicketToFrontend(addedRes.rows[0]));
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Self-assign ticket (restricted to agents)
app.patch('/api/tickets/:id/assign', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'Agent') {
    return res.status(403).json({ message: 'Only support agents can assign tickets' });
  }

  try {
    // Check if ticket exists
    const ticketCheck = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update ticket to be assigned to the logged in Agent
    await pool.query(
      'UPDATE tickets SET assignee_id = $1, status = $2, claimed_at = NOW(), updated_at = NOW() WHERE id = $3',
      [req.user.id, 'Assigned', id]
    );

    // Fetch the updated ticket details
    const result = await pool.query(
      `SELECT t.*, u.name AS requestor_name, a.name AS assignee_name 
       FROM tickets t 
       LEFT JOIN users u ON t.requestor_id = u.id 
       LEFT JOIN users a ON t.assignee_id = a.id 
       WHERE t.id = $1`,
      [id]
    );

    res.json(mapTicketToFrontend(result.rows[0]));
  } catch (err) {
    console.error('Error assigning ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update ticket status
app.patch('/api/tickets/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status field is required' });
  }

  const validStatuses = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const ticketCheck = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ticket = ticketCheck.rows[0];

    // Auth constraints: Agents can modify any, Requestors can only update status if it is their own ticket (e.g. to Close it)
    if (req.user.role !== 'Agent' && ticket.requestor_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this ticket' });
    }

    let statusTimeColumn = '';
    if (status === 'Assigned') statusTimeColumn = ', claimed_at = NOW()';
    else if (status === 'In Progress') statusTimeColumn = ', in_progress_at = NOW()';
    else if (status === 'Pending') statusTimeColumn = ', pending_at = NOW()';
    else if (status === 'Resolved') statusTimeColumn = ', resolved_at = NOW()';
    else if (status === 'Closed') statusTimeColumn = ', closed_at = NOW()';

    await pool.query(
      `UPDATE tickets SET status = $1, updated_at = NOW()${statusTimeColumn} WHERE id = $2`,
      [status, id]
    );

    // Fetch the updated ticket details
    const result = await pool.query(
      `SELECT t.*, u.name AS requestor_name, a.name AS assignee_name 
       FROM tickets t 
       LEFT JOIN users u ON t.requestor_id = u.id 
       LEFT JOIN users a ON t.assignee_id = a.id 
       WHERE t.id = $1`,
      [id]
    );

    res.json(mapTicketToFrontend(result.rows[0]));
  } catch (err) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile settings
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { name, email, department } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, department = $3 WHERE id = $4 RETURNING id, email, name, role, department, created_at',
      [name, email.toLowerCase(), req.user.role === 'Agent' ? department || null : null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: user.created_at,
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all agents
app.get('/api/users/agents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, department FROM users WHERE role = 'Agent' ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching agents list:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get active and resolved ticket counts for all teams
app.get('/api/teams/metrics', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Agent') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const query = `
      SELECT 
        assigned_team,
        COUNT(CASE WHEN status NOT IN ('Resolved', 'Closed') THEN 1 END)::int AS active_count,
        COUNT(CASE WHEN status = 'Resolved' AND resolved_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int AS resolved_count
      FROM tickets
      GROUP BY assigned_team
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching team metrics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
