// Connection to PostGres, to be used to execute queries
const { Pool } = require("pg");
const connectionString = process.env.DATABASE_URL;
console.log(connectionString)

const pool = new Pool({
  connectionString: connectionString
});

module.exports = pool;
