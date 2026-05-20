const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  console.log('Connected to Postgres.');

  // List all tables to see the join table name
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_name LIKE '%mega_menu%' OR table_name LIKE '%navbar_section%';
  `);
  console.log('Tables:', tablesRes.rows.map(r => r.table_name));

  // Let's query navbar sections
  const sectionsRes = await client.query('SELECT id, document_id, title, locale FROM navbar_sections;');
  console.log('\nNavbar Sections:', sectionsRes.rows);

  // Let's query mega menu groups
  const groupsRes = await client.query('SELECT id, document_id, title, locale FROM mega_menu_groups;');
  console.log('\nMega Menu Groups:', groupsRes.rows);

  // Find dynamic join tables or columns
  for (const table of tablesRes.rows.map(r => r.table_name)) {
    try {
      const data = await client.query(`SELECT * FROM ${table} LIMIT 5;`);
      console.log(`\nData from ${table}:`, data.rows);
    } catch (e) {
      console.log(`Failed to query ${table}:`, e.message);
    }
  }

  await client.end();
}

run().catch(console.error);
