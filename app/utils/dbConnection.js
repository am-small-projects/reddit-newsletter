// Connection to PostGres, to be used to execute queries
const { Pool } = require("pg");
const logger = require("./logger");

const connectionString = process.env.DATABASE_URL;
logger.info(`Connecting to the PostGIS Database`);

const pool = new Pool({
  connectionString: connectionString
});

module.exports = pool;
