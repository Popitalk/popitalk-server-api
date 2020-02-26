const router = require("express").Router();

router.use(require("./addMember"));
router.use(require("./updateMember"));
router.use(require("./deleteMember"));

module.exports = router;
