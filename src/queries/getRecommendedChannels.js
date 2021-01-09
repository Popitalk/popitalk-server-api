const knex = require("../config/knex");

module.exports = ({ categories }) => {
  const innerQuery = knex
    .select("channels.id AS ids")
    .from("channels")
    .leftJoin(
      "channel_categories",
      "channels.id",
      "channel_categories.channel_id"
    )
    .where("channels.type", "channel")
    .andWhere("channels.public", true);

  if (categories) {
    innerQuery.whereIn("channel_categories.category_name", categories);
  }

  innerQuery
    .groupBy("channels.id")
    .orderByRaw("random()")
    .limit(24);

  const query = knex.raw(
    `
    SELECT
    COALESCE(JSON_AGG(chans.ids), '[]'::JSON) AS "channelIds"
    FROM (
    ${innerQuery.toString()}
    ) AS chans
    `
  );

  return query.toString();
};
