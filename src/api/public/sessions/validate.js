const router = require("express").Router();
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const loginUserData = require("../../../helpers/loginUserData");

router.get("/validate", authenticateUser, async (req, res) => {
  req.session.user = req.user;
  const response = await loginUserData({ userId: req.user.id });
  res.json(response);
});

module.exports = router;
