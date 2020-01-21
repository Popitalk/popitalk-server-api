const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { celebrate, Joi } = require("celebrate");
const { sendRegistrationEmail } = require("../../../config/jobs");
const addUser = require("../../../database/queries/addUser");
const addChannel = require("../../../database/queries/addChannel");
const addMembers = require("../../../database/queries/addMembers");
const config = require("../../../config");
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const database = require("../../../config/database");

router.post(
  "/",
  celebrate({
    body: Joi.object()
      .keys({
        firstName: Joi.string()
          .min(1)
          .max(50)
          .required(),
        lastName: Joi.string()
          .min(1)
          .max(50)
          .required(),
        username: Joi.string()
          .min(3)
          .max(30)
          .required(),
        dateOfBirth: Joi.date()
          .iso()
          .max(new Date(new Date() - 1000 * 60 * 60 * 24 * 365 * 13))
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string()
          .min(6)
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/\d+/)
          .required()
      })
      .required()
  }),
  async (req, res, next) => {
    const {
      firstName,
      lastName,
      username,
      dateOfBirth,
      email,
      password
    } = req.body;

    const client = await database.connect();

    try {
      await client.query("BEGIN");
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await addUser(
        {
          firstName,
          lastName,
          username,
          dateOfBirth,
          password: hashedPassword,
          email
        },
        client
      );

      if (!newUser) throw new ApiError();

      const newChannel = await addChannel({ type: "self" }, client);

      if (!newChannel) throw new ApiError();

      const newMember = await addMembers(
        { channelId: newChannel.id, userIds: [newUser.id] },
        client
      );

      if (!newMember) throw new ApiError();

      if (!config.benchmark) {
        await sendRegistrationEmail(email);
      }

      res.location(`${req.baseUrl}/${newUser.id}`);
      await client.query("COMMIT");
      res.status(201).json(newUser);
      // res.status(201).json({
      //   ...newUser,
      //   channels: {
      //     [newChannel.id]: {
      //       ...newChannel
      //     }
      //   }
      // });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof DatabaseError) {
        if (
          error.codeName === "unique_violation" &&
          error.constraint === "unique_username"
        ) {
          next(new ApiError("Username already in use", 409, error));
        } else if (
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
    } finally {
      client.release();
    }
  }
);

module.exports = router;
