const queries = require("../queries");

class CategoryRepository {
  constructor(db) {
    this.db = db;
  }

  async addCategory({ category }) {
    return this.db.one(queries.addCategory, [category]);
  }

  async getCategories() {
    return this.db.manyOrNone(queries.getCategories);
  }

  async addChannelCategories({ channelId, categories }) {
    return this.db.many(queries.addChannelCategories, {
      channelId,
      categories
    });
  }

  async getChannelCategories({ channelId }) {
    return this.db.manyOrNone(queries.getChannelCategories, [channelId]);
  }
}

module.exports = CategoryRepository;
