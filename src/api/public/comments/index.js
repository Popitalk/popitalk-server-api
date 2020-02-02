const router = require("express").Router();

router.use(require("./addComment"));
router.use(require("./getComments"));
// router.use(require("./deletePost"));

module.exports = router;
