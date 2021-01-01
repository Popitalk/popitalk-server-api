const db = require("../config/database");

module.exports.addCategory = async ({ category }) => {
  return db.task(async t => {
    const a = await t.CategoryRepository.addCategory({
      category
    });
    return a;
  });
};
