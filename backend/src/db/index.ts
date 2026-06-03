import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Helper for queries that require tenant context
export const tenantQuery = async (tenantId: string, text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    // Set the tenant id for the session
    await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};
