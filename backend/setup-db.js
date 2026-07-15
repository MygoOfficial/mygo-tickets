import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pkg;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2914',
};

async function runSetup() {
  console.log('Connecting to PostgreSQL to check database existence...');
  const client = new Client({
    ...dbConfig,
    database: 'postgres', // Connect to default DB first
  });

  try {
    await client.connect();

    // Check if mygo_tickets database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'mygo_tickets'"
    );

    if (dbCheck.rowCount === 0) {
      console.log("Database 'mygo_tickets' does not exist. Creating it...");
      // CREATE DATABASE cannot run inside a transaction block
      await client.query('CREATE DATABASE mygo_tickets');
      console.log("Database 'mygo_tickets' created successfully.");
    } else {
      console.log("Database 'mygo_tickets' already exists.");
    }
  } catch (err) {
    console.error('Error checking/creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log("Connecting to 'mygo_tickets' to initialize schema...");
  const pool = new Client({
    ...dbConfig,
    database: 'mygo_tickets',
  });

  try {
    await pool.connect();

    // Drop tables if they exist (for clean start/reset)
    console.log('Cleaning up existing tables...');
    await pool.query('DROP TABLE IF EXISTS tickets CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Requestor', 'Agent')),
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table
    console.log('Creating tickets table...');
    await pool.query(`
      CREATE TABLE tickets (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
        status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed')),
        requestor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_team VARCHAR(100) NOT NULL,
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        sla VARCHAR(100) NOT NULL,
        tenant_id VARCHAR(100),
        source VARCHAR(255),
        logs JSONB,
        claimed_at TIMESTAMP,
        in_progress_at TIMESTAMP,
        pending_at TIMESTAMP,
        resolved_at TIMESTAMP,
        closed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const userMap = {}; // Maps name to id

    if (process.env.SEED_MOCK_DATA === 'true') {
      // Seed users
      console.log('Seeding users...');
      const hashedPwd = await bcrypt.hash('password123', 10);
      
      const requestorUsers = [
        ['Sarah Chen', 'sarah@example.com', hashedPwd, 'Requestor', null],
        ['Raj Patel', 'raj@example.com', hashedPwd, 'Requestor', null],
        ['Emily Watson', 'emily@example.com', hashedPwd, 'Requestor', null],
        ['Tom Wilson', 'tom@example.com', hashedPwd, 'Requestor', null],
        ['Priya Sharma', 'priya@example.com', hashedPwd, 'Requestor', null],
        ['John Doe', 'john@example.com', hashedPwd, 'Requestor', null],
      ];

      const agentUsers = [
        ['Mike Johnson', 'mike@example.com', hashedPwd, 'Agent', 'IT Support'],
        ['Lisa Park', 'lisa@example.com', hashedPwd, 'Agent', 'HR Operations'],
        ['Dave Chen', 'dave@example.com', hashedPwd, 'Agent', 'IT Support'],
        ['Karen Lee', 'karen@example.com', hashedPwd, 'Agent', 'IT Security'],
        ['Admin Agent', 'admin@example.com', hashedPwd, 'Agent', 'IT Support'],
      ];

      for (const [name, email, pwd, role, department] of [...requestorUsers, ...agentUsers]) {
        const res = await pool.query(
          'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [name, email, pwd, role, department]
        );
        userMap[name] = res.rows[0].id;
      }
    } else {
      console.log('Skipping user seeding (production clean state)');
    }

    console.log('Seeding tickets...');
    const initialTickets = [
      {
        id: "TKT-001",
        title: "New laptop request for onboarding",
        description: "Need a MacBook Pro for new hire starting March 28",
        category: "IT Operations",
        subcategory: "Asset Requests",
        priority: "High",
        status: "In Progress",
        requestor: "Sarah Chen",
        assignedTeam: "IT Support",
        assignee: "Mike Johnson",
        sla: "4h Response / 24h Resolution",
        tenantId: "tenant-yoda-123",
        source: "myyodaai.mygoapps.com",
        logs: [
          "[INFO] 2026-03-22 08:55:12 - Application started successfully",
          "[INFO] 2026-03-22 08:56:45 - User clicked support button",
          "[WARN] 2026-03-22 08:57:10 - Failed to load resource: connection timed out",
          "[ERROR] 2026-03-22 08:58:30 - FetchError: Failed to fetch user profile",
          "[ERROR] 2026-03-22 08:59:01 - App crashed on main rendering loop due to null reference"
        ],
        claimedAt: "2026-03-22T09:30:00Z",
        inProgressAt: "2026-03-22T10:00:00Z",
        createdAt: "2026-03-22T09:00:00Z",
        updatedAt: "2026-03-22T11:30:00Z",
      },
      {
        id: "TKT-002",
        title: "SAP access for new consultant",
        description: "Grant SAP FI/CO access for Alex Kumar joining Finance team",
        category: "Access Management",
        subcategory: "SAP Access",
        priority: "Medium",
        status: "Pending",
        requestor: "Raj Patel",
        assignedTeam: "IT Security",
        assignee: null,
        sla: "2h Response / 8h Resolution",
        tenantId: "tenant-docsync-456",
        source: "mydocsyncai.mygoapps.com",
        logs: [
          "[INFO] 2026-03-21 13:45:00 - SAP integration module initialized",
          "[WARN] 2026-03-21 13:47:12 - Slow response from SAP RFC gateway: 4500ms",
          "[ERROR] 2026-03-21 13:50:23 - RFC_ERROR_SYSTEM_FAILURE: No authorization for transaction RFC"
        ],
        pendingAt: "2026-03-22T08:00:00Z",
        createdAt: "2026-03-21T14:00:00Z",
        updatedAt: "2026-03-22T08:00:00Z",
      },
      {
        id: "TKT-003",
        title: "Payroll discrepancy - March salary",
        description: "Overtime hours not reflected in March payslip",
        category: "HR & Payroll",
        subcategory: "Payroll Queries",
        priority: "High",
        status: "Assigned",
        requestor: "Emily Watson",
        assignedTeam: "Payroll",
        assignee: "Lisa Park",
        sla: "1h Response / 4h Resolution",
        tenantId: "tenant-resume-789",
        source: "resume.mygo-ops.com",
        logs: [
          "[INFO] 2026-03-23 06:30:15 - Candidate tracker UI initialized",
          "[ERROR] 2026-03-23 06:45:10 - Database connection pool exhausted on worker pool #2"
        ],
        claimedAt: "2026-03-23T07:15:00Z",
        createdAt: "2026-03-23T07:00:00Z",
        updatedAt: "2026-03-23T07:15:00Z",
      },
      {
        id: "TKT-004",
        title: "Company onboarding - batch of 5",
        description: "New batch of consultants joining on April 1st",
        category: "Employee Lifecycle",
        subcategory: "Company Onboarding",
        priority: "Critical",
        status: "New",
        requestor: "John Doe",
        assignedTeam: "HR Operations",
        assignee: null,
        sla: "30m Response / 2h Resolution",
        createdAt: "2026-03-23T08:00:00Z",
        updatedAt: "2026-03-23T08:00:00Z",
      },
      {
        id: "TKT-005",
        title: "VPN connectivity issue",
        description: "Unable to connect to corporate VPN from home office",
        category: "IT Operations",
        subcategory: "Infrastructure Issues",
        priority: "Medium",
        status: "Resolved",
        requestor: "Tom Wilson",
        assignedTeam: "IT Support",
        assignee: "Dave Chen",
        sla: "2h Response / 8h Resolution",
        claimedAt: "2026-03-20T10:30:00Z",
        inProgressAt: "2026-03-20T11:00:00Z",
        resolvedAt: "2026-03-20T14:00:00Z",
        createdAt: "2026-03-20T10:00:00Z",
        updatedAt: "2026-03-20T14:00:00Z",
      },
      {
        id: "TKT-006",
        title: "Visa renewal documentation",
        description: "H1B visa renewal - need employment verification letter",
        category: "Immigration",
        subcategory: "Visa / Documentation",
        priority: "High",
        status: "In Progress",
        requestor: "Priya Sharma",
        assignedTeam: "Immigration",
        assignee: "Karen Lee",
        sla: "1h Response / 24h Resolution",
        claimedAt: "2026-03-22T17:00:00Z",
        inProgressAt: "2026-03-23T09:00:00Z",
        createdAt: "2026-03-22T16:00:00Z",
        updatedAt: "2026-03-23T09:00:00Z",
      },
    ];

    if (process.env.SEED_MOCK_DATA === 'true') {
      console.log('Seeding demo tickets...');
      for (const ticket of initialTickets) {
        const reqId = userMap[ticket.requestor] || null;
        const assId = ticket.assignee ? userMap[ticket.assignee] || null : null;

        await pool.query(
          `INSERT INTO tickets 
          (id, title, description, category, subcategory, priority, status, requestor_id, assigned_team, assignee_id, sla, tenant_id, source, logs, claimed_at, in_progress_at, pending_at, resolved_at, closed_at, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
          [
            ticket.id,
            ticket.title,
            ticket.description,
            ticket.category,
            ticket.subcategory,
            ticket.priority,
            ticket.status,
            reqId,
            ticket.assignedTeam,
            assId,
            ticket.sla,
            ticket.tenantId || null,
            ticket.source || null,
            ticket.logs ? JSON.stringify(ticket.logs) : null,
            ticket.claimedAt || null,
            ticket.inProgressAt || null,
            ticket.pendingAt || null,
            ticket.resolvedAt || null,
            ticket.closedAt || null,
            ticket.createdAt,
            ticket.updatedAt,
          ]
        );
      }
    } else {
      console.log('Skipping ticket seeding (production clean state)');
    }

    console.log('Database successfully initialized and seeded!');
  } catch (err) {
    console.error('Error during schema execution:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSetup();
