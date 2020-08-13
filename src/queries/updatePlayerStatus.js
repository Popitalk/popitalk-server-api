/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");
const moment = require("moment");

module.exports = ({
  channelId,
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

  if (status) {
    playerStatus.status = status;
    
    if (status === "Playing") {
      playerStatus.clock_start_time = moment(clockStartTime)
        .add(3, "seconds").format();
    }
  }

  const query = knex
    .update(playerStatus)
    .from("channels")
    .where("id", channelId)
    .returning([
      "queue_start_position AS queueStartPosition",
      "video_start_time AS videoStartTime",
      "clock_start_time AS clockStartTime",
      "status"
    ]);

  return query.toString();
};
