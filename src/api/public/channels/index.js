const router = require("express").Router();

router.use(require("./getChannel"));
router.use(require("./addRoom"));
router.use(require("./inviteFriends"));
router.use(require("./updateRoom"));

module.exports = router;
