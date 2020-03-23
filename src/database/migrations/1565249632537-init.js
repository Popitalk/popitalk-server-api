const path = require("path");
const { QueryFile } = require("pg-promise");
const logger = require("../../config/logger");
const db = require("../../config/database");

function sql(file) {
  const fullPath = path.join(__dirname, file);
  const options = { minify: true };
  const qf = new QueryFile(fullPath, options);
  if (qf.error) logger.error(qf.error);
  return qf;
}

module.exports.up = async () => {
  try {
    await db.tx(async tx => {
      await tx.any("CREATE SCHEMA IF NOT EXISTS public");
      await tx.any(sql("../schemas/1565249632537-init/up/extensions.sql"));
      await tx.any(sql("../schemas/1565249632537-init/up/sequences.sql"));
      await tx.any(sql("../schemas/1565249632537-init/up/functions.sql"));
      await tx.any(sql("../schemas/1565249632537-init/up/tables.sql"));
      await tx.any(sql("../schemas/1565249632537-init/up/triggers.sql"));
      await tx.any(sql("../schemas/1565249632537-init/up/indices.sql"));
    });
  } catch (error) {
    logger.error(error);
  }
};

module.exports.down = async () => {
  try {
    await db.any(sql("../schemas/1565249632537-init/down/init-down.sql"));
  } catch (error) {
    logger.error(error);
  }
};

module.exports.description = "V1.0";
