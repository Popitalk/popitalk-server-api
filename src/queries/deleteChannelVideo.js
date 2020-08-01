/* eslint-disable no-nested-ternary */
const knex = require("../config/knex");

module.exports = ({ channelVideoId }) => {
  const query = knex("channel_videos")
    .where("id", channelVideoId)
    .del()
    .returning("id as channelVideoId");
  console.log(query.toString());
  return query.toString();
};
