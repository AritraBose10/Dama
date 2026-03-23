const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:XCmeTqH5CEavunC6@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
async function check() {
  await client.connect();
  const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients';`);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
check().catch(console.error);
