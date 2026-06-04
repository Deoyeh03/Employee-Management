const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/antigravity' });
client.connect().then(() => {
  client.query("UPDATE employees SET password_hash = '$2b$10$Rhsm.GldGIG1GSfnYvnM.OlQWUiY.sfBfU.8d24ec0CHRg5CUURXu' WHERE email = 'admin@example.com';").then(() => {
    console.log('Done');
    process.exit(0);
  });
});
