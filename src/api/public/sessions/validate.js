const router = require("express").Router();
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.get("/validate", authenticateUser, (req, res) => {
  req.session.user = req.user;
  res.json(req.user);
});

module.exports = router;
