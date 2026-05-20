const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  console.log('Connected to Postgres.');

  // Find users-permissions tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_name LIKE '%permission%';
  `);
  console.log('Permission Tables:', tablesRes.rows.map(r => r.table_name));

  const permTable = tablesRes.rows.map(r => r.table_name)[0] || 'up_permissions';

  // Query permissions to see what actions exist
  try {
    const perms = await client.query(`SELECT * FROM ${permTable} WHERE action LIKE '%mega-menu-group%' OR action LIKE '%navbar-section%';`);
    console.log('\nExisting Permissions:', perms.rows);
  } catch (e) {
    console.log('Error querying permissions:', e.message);
  }

  // Let's see what roles exist
  try {
    const rolesRes = await client.query('SELECT * FROM up_roles;');
    console.log('\nRoles:', rolesRes.rows);
  } catch (e) {
    console.log('Error querying roles:', e.message);
  }

  await client.end();
}

run().catch(console.error);
