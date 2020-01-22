const router = require("express").Router();

router.use(require("./addMessage"));
router.use(require("./getMessages"));
router.use(require("./deleteMessage"));

module.exports = router;
