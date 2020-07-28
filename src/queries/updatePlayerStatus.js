/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");

module.exports = ({
  channelId,
  userId,
  queueStartPosition,
  videoStartTime,
  clockStartTime,
  status = null
}) => {
  let playerStatus = {
    updated_at: knex.raw("NOW()"),
    queue_start_position: queueStartPosition,
    video_start_time: videoStartTime,
    clock_start_time: clockStartTime
  };
  if (status !== null) {
    playerStatus.status = status;
  }

  const query = knex
    .update(playerStatus)
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
      "queue_start_position AS queueStartPosition",
      "video_start_time AS videoStartTime",
      "clock_start_time AS clockStartTime",
      "status"
    ]);

  return query.toString();
};
