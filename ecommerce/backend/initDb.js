const db = require('./config/db');

const initDB = async () => {
  try {
    console.log('Initializing Database...');

    // 1. Create Schemas
    await db.query(`CREATE SCHEMA IF NOT EXISTS customer;`);
    await db.query(`CREATE SCHEMA IF NOT EXISTS orders;`);
    await db.query(`CREATE SCHEMA IF NOT EXISTS auth;`);

    // 2. Auth Tables
    // Create auth.admins (New requirement)
    await db.query(`
        CREATE TABLE IF NOT EXISTS auth.admins (
            admin_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    `);

    // Seed Admin if not exists
    await db.query(`
        INSERT INTO auth.admins (admin_id, email, password_hash, full_name)
        VALUES ('admin_1', 'bob@example.com', 'admin123', 'Bob Admin')
        ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database initialized and seeded.');
  } catch (err) {
    console.error('Error verifying database connection:', err);
  }
};

module.exports = initDB;
