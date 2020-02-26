const router = require("express").Router();

router.use(require("./addPost"));
router.use(require("./getPosts"));
router.use(require("./deletePost"));

module.exports = router;
