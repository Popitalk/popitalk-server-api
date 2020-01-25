const router = require("express").Router();

router.use(require("./getChannel"));
router.use(require("./addChannel"));
router.use(require("./addRoom"));
router.use(require("./inviteFriends"));
router.use(require("./updateRoom"));
router.use(require("./leaveRoom"));

module.exports = router;
