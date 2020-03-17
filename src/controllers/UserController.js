const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const asyncHandler = require("express-async-handler");
const { cache } = require("../helpers/middleware/cache");
const authenticateUser = require("../helpers/middleware/authenticateUser");
const { UserService } = require("../services");
const validators = require("../helpers/validators");

module.exports.getUser = router.get(
  "/:userId",
  // cache,
  // authenticateUser,
  validators.getUser,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await UserService.getUser({ userId });
    res.json({
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar
    });
  })
);

module.exports.addUser = router.post(
  "/",
  // cache,
  // authenticateUser,
  validators.addUser,
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      username,
      dateOfBirth,
      email,
      password,
      userId
    } = req.body;
    const user = await UserService.getUser({ userId });
    res.json({
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar
    });
  })
);

module.exports.searchUsers = router.get(
  "/",
  // cache,
  // authenticateUser,
  validators.searchUsers,
  asyncHandler(async (req, res) => {
    const { username } = req.query;
    const users = await UserService.searchUsers({ username });
    res.json(users);
  })
);
