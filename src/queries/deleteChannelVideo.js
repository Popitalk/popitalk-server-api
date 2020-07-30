/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");

module.exports = ({
  channelVideoId
}) => {
  const query = knex("channel_videos")
    .where("id", channelVideoId)
    .del();

  return query.toString();
};
