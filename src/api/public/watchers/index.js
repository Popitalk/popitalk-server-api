const router = require("express").Router();

router.use(require("./addWatcher"));
router.use(require("./deleteWatcher"));

module.exports = router;
