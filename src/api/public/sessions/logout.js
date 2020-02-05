const router = require("express").Router();
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const { websocketsOfUsers } = require("../../../config/state");

router.post("/logout", authenticateUser, (req, res) => {
  const ws = websocketsOfUsers.get(req.session.passport.user);

  if (ws) ws.close();

  req.logout();

  res.status(204).json({});
});

module.exports = router;
