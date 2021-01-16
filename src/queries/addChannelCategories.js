const knex = require("../config/knex");

module.exports = ({ channelId, categories }) => {
  const rows = categories.map(category => ({
    channel_id: channelId,
    category_name: category
  }));

  const query = knex("channel_categories")
    .insert(rows)
    .returning(["category_name"]);

  return query.toString();
};
