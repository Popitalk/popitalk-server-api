const knex = require("../config/knex");

module.exports = ({
  channelId
}) => {
  const query = knex
    .select("cvs.id AS id")
    .select("cvs.channel_id AS channelId")
    .select("cvs.video_id AS videoId")
    .select("cvs.queue_position AS queuePosition")
    .select("vs.length")
    .select("vs.video_info AS videoInfo")
    .from("channel_videos AS cvs")
    .innerJoin("videos AS vs", "vs.id", "cvs.video_id")
    .where("cvs.channel_id", channelId)
    .orderBy("cvs.queue_position", "ASC");

  console.log(query.toString());

  return query.toString();
};
