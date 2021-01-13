const db = require("../config/database");

module.exports.addCategory = async ({ category }) => {
  return db.task(async t => {
    const newCategory = await t.CategoryRepository.addCategory({
      category
    });
    return newCategory;
  });
};

module.exports.getCategories = async () => {
  return db.task(async t => {
    const categories = await t.CategoryRepository.getCategories();

    return categories;
  });
};

module.exports.getTopCategories = async () => {
  return db.task(async t => {
    const categories = await t.CategoryRepository.getTopCategories();

    return categories;
  });
};
