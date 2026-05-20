const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  console.log('Connected to Postgres.');

  // Check columns of up_permissions and up_permissions_role_lnk
  const colsPerms = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='up_permissions';");
  console.log('up_permissions columns:', colsPerms.rows.map(r => r.column_name));

  const colsLnk = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='up_permissions_role_lnk';");
  console.log('up_permissions_role_lnk columns:', colsLnk.rows.map(r => r.column_name));

  // Let's print some links to see format
  const links = await client.query("SELECT * FROM up_permissions_role_lnk LIMIT 5;");
  console.log('Links sample:', links.rows);

  // Let's add permissions for public and authenticated roles for api::mega-menu-group.mega-menu-group
  // Actions: 'api::mega-menu-group.mega-menu-group.find', 'api::mega-menu-group.mega-menu-group.findOne'
  const actions = [
    'api::mega-menu-group.mega-menu-group.find',
    'api::mega-menu-group.mega-menu-group.findOne'
  ];

  for (const action of actions) {
    // Check if permission already exists in up_permissions
    const check = await client.query("SELECT id FROM up_permissions WHERE action=$1;", [action]);
    let permId;
    if (check.rows.length === 0) {
      // Generate document_id (random string for Strapi v5)
      const docId = Math.random().toString(36).substring(2, 16);
      const insert = await client.query(
        "INSERT INTO up_permissions (action, document_id, created_at, updated_at, published_at, locale) VALUES ($1, $2, NOW(), NOW(), NOW(), null) RETURNING id;",
        [action, docId]
      );
      permId = insert.rows[0].id;
      console.log(`Inserted permission for ${action} with ID ${permId}`);
    } else {
      permId = check.rows[0].id;
      console.log(`Permission for ${action} already exists with ID ${permId}`);
    }

    // Link to Public (role_id 2) and Authenticated (role_id 1)
    const roles = [1, 2];
    for (const roleId of roles) {
      const checkLnk = await client.query(
        "SELECT id FROM up_permissions_role_lnk WHERE permission_id=$1 AND role_id=$2;",
        [permId, roleId]
      );
      if (checkLnk.rows.length === 0) {
        // Find max_id to insert cleanly if needed, or let DB auto-increment
        await client.query(
          "INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES ($1, $2);",
          [permId, roleId]
        );
        console.log(`Linked permission ID ${permId} to role ID ${roleId}`);
      } else {
        console.log(`Link between permission ID ${permId} and role ID ${roleId} already exists`);
      }
    }
  }

  await client.end();
  console.log('Completed.');
}

run().catch(console.error);
