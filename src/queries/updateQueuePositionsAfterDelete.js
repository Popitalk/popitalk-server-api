const knex = require("../config/knex");

module.exports = ({ channelId, queuePosition }) => {
  const query = knex("channel_videos")
    .where("channel_id", channelId)
    .andWhere("queue_position", ">", queuePosition)
    .decrement("queue_position", 1)
    .returning("*");

  console.log(query.toString());
  return query.toString();
};