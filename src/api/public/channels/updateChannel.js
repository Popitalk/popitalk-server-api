const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const fileType = require("file-type");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const updateChannel = require("../../../database/queries/updateChannel");
const { uploadFile } = require("../../../config/aws");
const multer = require("../../../helpers/middleware/multer");
const { publisher } = require("../../../config/pubSub");
const { WS_UPDATE_CHANNEL } = require("../../../config/constants");

router.put(
  "/:channelId",
  authenticateUser,
  // invalidateCache,
  multer.single("icon"),
  celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(3)
          .max(20)
          .optional(),
        description: Joi.string()
          .min(0)
          .max(150)
          .optional(),
        public: Joi.boolean().optional(),
        removeIcon: Joi.boolean().optional()
      })
      .optional()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { channelId } = req.params;
    const { name, description, public: publicChannel, removeIcon } = req.body;
    const icon = req.file;
    let uploadedIcon;

    try {
      if (icon && removeIcon)
        throw new ApiError(`Either icon must be provided or removeIcon.`, 400);

      if (!name && !description && !publicChannel && !removeIcon && !icon)
        throw new ApiError(`Haven't passed anything to update.`, 400);

      if (icon) {
        const { buffer } = icon;
        const type = fileType(buffer);
        const fileName = `icon-${userId}_${new Date().getTime()}`;
        const uploadedImage = await uploadFile(buffer, fileName, type);

        if (!uploadedImage) throw new ApiError(`Couldn't upload icon`, 500);

        uploadedIcon = uploadedImage.Location;
      }

      const updatedChannel = await updateChannel({
        channelId,
        userId,
        name,
        description,
        publicChannel,
        icon: uploadedIcon,
        removeIcon
      });

      if (!updatedChannel)
        throw new ApiError(`Channel with id of ${channelId} not found`, 404);

      res.status(200).json({
        channelId,
        updatedChannel
      });

      publisher({
        type: WS_UPDATE_CHANNEL,
        channelId,
        initiator: userId,
        payload: {
          userId,
          channelId,
          updatedChannel
        }
      });
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
