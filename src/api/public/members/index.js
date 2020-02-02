const router = require("express").Router();

router.use(require("./updateMember"));
router.use(require("./addMember"));

module.exports = router;
