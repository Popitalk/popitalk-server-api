/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");

module.exports = ({ channelId, userId }) => {
  const query = knex
    .select(
      "id",
      "queue_start_position AS queueStartPosition",
      "video_start_time AS videoStartTime",
      "clock_start_time AS clockStartTime",
      "status"
    )
    .from("channels")
    .where("id", channelId)
    .whereExists(q =>
      q
        .select("*")
        .from("members")
        .where("channel_id", channelId)
        .andWhere("user_id", userId)
        .andWhere("banned", false).whereRaw(/* SQL */ `
        (
          channels.type != 'channel'
          OR members.banned = false
        )
      `)
    );
  console.log("query", query.toString());
  return query.toString();
};
