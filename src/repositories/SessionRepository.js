/* eslint-disable class-methods-use-this */
const queries = require("../database/queries");

class SessionRepository {
  constructor(db) {
    this.db = db;
  }

  async getLoginData({ userId }) {
    return this.db.one(queries.getLoginData, [userId]);
  }
}

module.exports = SessionRepository;
