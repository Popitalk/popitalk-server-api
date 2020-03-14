const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const fileType = require("file-type");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { cache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const addChannel = require("../../../database/queries/addChannel");
const addMembers = require("../../../database/queries/addMembers");
const updateChannel = require("../../../database/queries/updateChannel");
const database = require("../../../config/database");
const { uploadFile } = require("../../../config/aws");
const multer = require("../../../helpers/middleware/multer");
const { publisher } = require("../../../config/pubSub");
const { WS_SUBSCRIBE_CHANNEL } = require("../../../config/constants");

router.post(
  "/",
  // cache,
  authenticateUser,
  multer.single("icon"),
  celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(3)
          .max(20)
          .required(),
        description: Joi.string()
          .min(1)
          .max(150)
          .required(),
        public: Joi.boolean().required()
      })
      .required()
  }),
  async (req, res, next) => {
    const { name, description, public: publicChannel } = req.body;
    const { id: userId } = req.user;
    const icon = req.file;
    let uploadedIcon;
    let updatedChannel;

    const client = await database.connect();
    try {
      await client.query("BEGIN");

      const channel = await addChannel(
        { name, description, publicChannel, ownerId: userId, type: "channel" },
        client
      );

      if (!channel) throw new ApiError();

      const newMembers = await addMembers(
        { channelId: channel.id, userIds: [userId], admin: true },
        client
      );

      if (!newMembers) throw new ApiError();

      channel.members = [userId];
      channel.admins = [userId];
      channel.banned = [];

      if (icon) {
        const { buffer } = icon;
        const type = fileType(buffer);
        const fileName = `channelIcon-${channel.id}_${new Date().getTime()}`;
        const uploadedImage = await uploadFile(buffer, fileName, type);

        if (!uploadedImage)
          throw new ApiError(`Couldn't upload channel icon`, 500);

        uploadedIcon = uploadedImage.Location;

        updatedChannel = await updateChannel(
          {
            channelId: channel.id,
            userId,
            icon: uploadedIcon
          },
          client
        );

        if (!updatedChannel) throw new ApiError();
      }

      await client.query("COMMIT");

      let payload;

      if (updatedChannel) {
        payload = {
          channelId: channel.id,
          channel: {
            ...channel,
            ...updatedChannel
          }
        };
      } else {
        payload = {
          channelId: channel.id,
          channel
        };
      }

      res.status(201).json(payload);

      publisher({
        type: WS_SUBSCRIBE_CHANNEL,
        channelId: channel.id,
        userId,
        payload: {
          userId,
          channelId: channel.id,
          type: "channel"
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    } finally {
      client.release();
    }
  }
);

module.exports = router;