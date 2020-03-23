const { DatabaseError } = require("./errors");

module.exports = error =>
  new DatabaseError({
    name: error.name,
    message: error.message,
    code: error.code,
    detail: error.detail,
    hint: error.hint,
    position: error.position,
    where: error.where,
    schema: error.schema,
    table: error.table,
    column: error.column,
    dataType: error.dataType,
    constraint: error.constraint,
    result: error.result,
    query: error.query,
    values: error.values,
    received: error.received
  });
