const router = require("express").Router();

router.use("/users", require("./users"));
router.use("/sessions", require("./sessions"));
router.use("/channels", require("./channels"));
router.use("/members", require("./members"));
router.use("/messages", require("./messages"));
router.use("/posts", require("./posts"));
router.use("/comments", require("./comments"));
router.use("/likes", require("./likes"));

module.exports = router;
