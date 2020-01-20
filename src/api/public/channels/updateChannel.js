const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const bcrypt = require("bcryptjs");
const fileType = require("file-type");
const faker = require("faker");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const getUser = require("../../../database/queries/getUser");
const updateUser = require("../../../database/queries/updateUser");
// const { publisher } = require("../../../config/pubSub");
// const { USER_UPDATE } = require("../../../config/constants");
const { uploadFile } = require("../../../config/aws");
const multer = require("../../../helpers/middleware/multer");

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
          .optional()
      })
      // .with("firstName", "password")
      // .with("lastName", "password")
      // .with("email", "password")
      // .with("dateOfBirth", "password")
      // .with("removeAvatar", "password")
      // .with("newPassword", "password")
      .required()
  }),
  async (req, res, next) => {
    const { id: userId } = req.user;
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      password,
      newPassword,
      removeAvatar
    } = req.body;
    const avatar = req.file;
    let uploadedAvatar;
    let hashedPassword;

    try {
      if (avatar && !password) {
        throw new ApiError(`Didn't provide password.`, 400);
      }

      if (avatar && removeAvatar)
        throw new ApiError(
          `Either avatar must be provided or removeAvatar.`,
          400
        );

      if (password) {
        const user = await getUser({ userId, withPassword: true });

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect)
          throw new ApiError(`The password is incorrect`, 401);
      }

      if (newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      if (avatar) {
        const { buffer } = avatar;
        const type = fileType(buffer);
        const fileName = `avatar-${userId}_${new Date().getTime()}`;
        const uploadedImage = await uploadFile(buffer, fileName, type);

        if (!uploadedImage) throw new ApiError(`Couldn't upload avatar`, 500);

        uploadedAvatar = uploadedImage.Location;
        // uploadedAvatar = faker.image.avatar();
      }

      const newUser = await updateUser({
        userId,
        firstName,
        lastName,
        dateOfBirth,
        email,
        password: hashedPassword,
        avatar: uploadedAvatar,
        removeAvatar
      });

      if (!newUser)
        throw new ApiError(`User with id of ${userId} not found`, 404);

      res.status(200).json(newUser);
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (
          error.codeName === "unique_violation" &&
          error.constraint === "unique_email"
        ) {
          next(new ApiError("Email already in use", 409, error));
        } else {
          next(new ApiError(undefined, undefined, error));
        }
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
