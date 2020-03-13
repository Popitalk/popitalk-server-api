const { Pool } = require("pg");
const config = require(".");

console.log("config.dbHost", config.dbHost);
console.log("config.dbPort", config.dbPort);
console.log("config.dbName", config.dbName);
console.log("config.dbUser", config.dbUser);
console.log("config.dbPassword", config.dbPassword);

const dbPool = new Pool({
  host: config.dbHost || "localhost",
  port: config.dbPort || 5432,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword
});

module.exports = dbPool;
