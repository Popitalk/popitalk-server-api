const errorCodes = require("pg-error-codes");

class DatabaseError extends Error {
  constructor({
    name,
    message,
    code,
    codeName,
    detail,
    hint,
    position,
    where,
    schema,
    table,
    column,
    dataType,
    constraint,
    result,
    query,
    values,
    received
  }) {
    super(message);
    this.message = message;
    this.name = name || this.constructor.name;
    if (position) this.position = position;
    if (code) {
      this.code = code;
      this.codeName = errorCodes[code];
    }
    if (codeName) this.code = codeName;
    if (detail) this.detail = detail;
    if (hint) this.hint = hint;
    if (position) this.position = position;
    if (where) this.where = where;
    if (schema) this.schema = schema;
    if (table) this.table = table;
    if (column) this.column = column;
    if (dataType) this.dataType = dataType;
    if (constraint) this.constraint = constraint;
    if (result) this.result = result;
    if (query) this.query = query;
    if (values) this.values = values;
    if (received) this.received = received;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = DatabaseError;
