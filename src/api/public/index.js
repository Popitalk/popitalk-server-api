const router = require("express").Router();

router.use("/users", require("./users"));
router.use("/sessions", require("./sessions"));
router.use("/channels", require("./channels"));
router.use("/messages", require("./messages"));
// router.use("/chat", require("./chat"));
// router.use("/guilds", require("./guilds"));
// router.use("/members", require("./members"));

module.exports = router;
