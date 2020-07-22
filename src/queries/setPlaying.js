/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");

module.exports = ({
  channelId,
  userId,
  queueStartPosition,
  videoStartTime,
  clockStartTime,
  status
}) => {
  const query = knex
    .update({
      updated_at: knex.raw("NOW()"),
      queue_start_postion: queueStartPosition,
      video_start_time: videoStartTime,
      clock_start_time: clockStartTime,
      status
    })
    .from("channels")
    .where("id", channelId)
    .whereExists(q =>
      q
        .select("*")
        .from("members")
        .where("channel_id", channelId)
        .andWhere("user_id", userId)
        .andWhere("admin", true).whereRaw(/* SQL */ `
        (
          channels.type != 'channel'
          OR members.admin
        )
      `)
    )
    .returning([
      "id",
      "queue_start_position AS queueStartPosition",
      "video_start_time AS videoStartTime",
      "clock_start_time AS clockStartTime",
      "status"
    ]);

  return query.toString();
};
