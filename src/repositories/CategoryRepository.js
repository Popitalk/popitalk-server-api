const queries = require("../queries");

class CategoryRepository {
  constructor(db) {
    this.db = db;
  }

  async addCategory({ category }) {
    return this.db.one(queries.addCategory, [category]);
  }
}

module.exports = CategoryRepository;
