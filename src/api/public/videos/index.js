const router = require("express").Router();

router.use(require("./searchVideos"));
router.use(require("./addVideo"));

module.exports = router;
