const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    const initSql = fs.readFileSync(path.join(__dirname, '../db-init/init.sql'), 'utf-8');
    console.log('Running init.sql...');
    await client.query(initSql);

    const shiftsSql = fs.readFileSync(path.join(__dirname, '../shifts.sql'), 'utf-8');
    console.log('Running shifts.sql...');
    await client.query(shiftsSql);

    const fixPasswordSql = fs.readFileSync(path.join(__dirname, '../fix_password.sql'), 'utf-8');
    console.log('Running fix_password.sql...');
    await client.query(fixPasswordSql);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
};

run();
