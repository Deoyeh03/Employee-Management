const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/antigravity' });

client.connect().then(async () => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      day VARCHAR(20) NOT NULL,
      time VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Shifts table created');
  process.exit(0);
});
