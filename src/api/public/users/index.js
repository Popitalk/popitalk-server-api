const router = require("express").Router();

router.use(require("./register"));
router.use(require("./getUser"));
router.use(require("./searchUsers"));
// router.use(require("./verifyEmail"));
router.use(require("./updateUser"));
router.use(require("./deleteUser"));

module.exports = router;
