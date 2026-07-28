const sql = require("mssql");

const config = {
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: false,              // college servers are often not set up for encrypted connections; try false first
    trustServerCertificate: true,
  },
  connectionTimeout: 15000,
};

let pool;

async function connectSQL() {
  try {
    pool = await sql.connect(config);
    console.log("✅ SQL Server Connected");
    return pool;
  } catch (err) {
    console.error("❌ SQL Server connection failed:", err.message);
    throw err;
  }
}

function getPool() {
  if (!pool) {
    throw new Error("SQL pool not initialized — call connectSQL() first");
  }
  return pool;
}

module.exports = { connectSQL, getPool, sql };