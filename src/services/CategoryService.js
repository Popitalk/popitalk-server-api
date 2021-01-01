const db = require("../config/database");

module.exports.addCategory = async ({ category }) => {
  return db.task(async t => {
    const a = await t.CategoryRepository.addCategory({
      category
    });
    return a;
  });
};

module.exports.getCategories = async () => {
  return db.task(async t => {
    const categories = await t.CategoryRepository.getCategories();

    return categories;
  });
};
