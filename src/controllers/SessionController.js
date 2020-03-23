const passport = require("passport");
const asyncHandler = require("express-async-handler");
const router = require("express").Router();
const authenticateUser = require("../helpers/middleware/authenticateUser");
const { websocketsOfUsers } = require("../config/state");
const SessionService = require("../services/SessionService");

router.post(
  "/login",
  passport.authenticate("local"),
  asyncHandler(async (req, res) => {
    req.session.user = req.user;
    res.json(req.user);
  })
);

router.post(
  "/logout",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const ws = websocketsOfUsers.get(req.session.passport.user);
    if (ws) ws.close();
    req.logout();
    res.status(204).json({});
  })
);

router.get(
  "/validate",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    req.session.user = req.user;
    const loginData = await SessionService.getLoginData({ userId });
    res.json(loginData);
  })
);

module.exports = router;
