const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const getChannelTypePublicMemberAdminBanned = require("../../../database/queries/getChannelTypePublicMemberAdminBanned");
const { publisher } = require("../../../config/pubSub");
const { WS_ADD_POST } = require("../../../config/constants");
const redis = require("../../../config/redis");

router.post(
  "/",
  // cache,
  authenticateUser,
  celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        videoId: Joi.string().required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId, videoId } = req.body;

    try {
      const channelInfo = await getChannelTypePublicMemberAdminBanned({
        channelId,
        userId
      });

      if (!channelInfo)
        throw new ApiError(`Channel with id ${channelId} not found`, 404);

      const { type, isAdmin } = channelInfo;

      if (type === "channel" && !isAdmin)
        throw new ApiError(`Not authorized to add video to queue`, 401);

      const unparsedVideo = await redis.get(`videos:${videoId}`);

      if (!unparsedVideo)
        throw new ApiError(`Video with id ${videoId} not found`, 404);

      const video = JSON.parse(unparsedVideo);

      const unparsedVideoQueue = await redis.get(`videoQueues:${channelId}`);

      let newVideoQueue;

      if (unparsedVideoQueue) {
        const videoQueue = JSON.parse(unparsedVideoQueue);
        let { videos } = videoQueue;
        const oldTime = videoQueue.startedPlayingAt;
        const currentTime = Date.now();
        let time = Math.floor((currentTime - oldTime) / 1000);

        let i = 0;
        while (i < videos.length) {
          if (time - videos[i].durationInSeconds < 0) break;
          else time -= videos[i].durationInSeconds;
          i++;
        }
        videos = videos.slice(i);

        newVideoQueue = {
          startedPlayingAt: Date.now(),
          videos: [...videos, video]
        };
      } else {
        newVideoQueue = {
          startedPlayingAt: Date.now() + 1000,
          videos: [video]
        };
      }

      await redis.setex(
        `videoQueues:${channelId}`,
        172800,
        JSON.stringify(newVideoQueue)
      );

      res.status(201).json({
        channelId,
        videoQueue: newVideoQueue
      });

      // publisher({
      //   type: WS_ADD_POST,
      //   channelId,
      //   initiator: userId,
      //   payload: newPost
      // });
    } catch (error) {
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
