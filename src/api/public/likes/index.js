const router = require("express").Router();

router.use(require("./addLike"));
router.use(require("./deleteLike"));

module.exports = router;
