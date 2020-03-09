const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { formatDistanceStrict } = require("date-fns");
const axios = require("axios");
const ytDuration = require("youtube-duration");
const HRNumbers = require("human-readable-numbers");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { cseApiKey, cseCxYoutube } = require("../../../config");
const redis = require("../../../config/redis");

router.get(
  "/search",
  // cache,
  authenticateUser,
  celebrate({
    query: Joi.object()
      .keys({
        source: Joi.string()
          .valid("youtube")
          .required(),
        terms: Joi.string()
          .min(1)
          .required(),
        page: Joi.number()
          .integer()
          .optional()
      })
      .required()
  }),
  async (req, res, next) => {
    const { source, terms, page } = req.query;
    const cseUrlPrefix =
      "https://www.googleapis.com/customsearch/v1/siterestrict?";

    const response = [];

    try {
      if (source === "youtube") {
        let url = `${cseUrlPrefix}key=${cseApiKey}&cx=${cseCxYoutube}&q=${terms}`;
        const promises = [];
        if (page) {
          url = `${url}&start=${(page - 1) * 10 + 1}`;
        }
        const ax = await axios.get(url);
        const pipeline = redis.pipeline();

        ax.data.items.forEach(item => {
          const videoItem = {
            source: "youtube",
            id: item.pagemap.videoobject[0].videoid,
            name: item.pagemap.videoobject[0].name,
            url: item.pagemap.videoobject[0].url,
            thumbnail: item.pagemap.videoobject[0].thumbnailurl,
            uploadDate: `${formatDistanceStrict(
              new Date(item.pagemap.videoobject[0].uploaddate),
              new Date()
            )} ago`,
            duration: ytDuration.format(item.pagemap.videoobject[0].duration),
            durationInSeconds: ytDuration.toSecond(
              item.pagemap.videoobject[0].duration
            ),
            views: `${HRNumbers.toHumanString(
              item.pagemap.videoobject[0].interactioncount
            )} views`
          };

          response.push(videoItem);

          promises.push(
            new Promise(resolve =>
              resolve(
                pipeline.setex(
                  `videos:${videoItem.id}`,
                  172800,
                  JSON.stringify(videoItem)
                )
              )
            )
          );
        });
        await Promise.all(promises);
        await pipeline.exec();
      }

      // if (response.length === 0) throw new ApiError(`No videos found`, 404);

      res.json(response);
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
