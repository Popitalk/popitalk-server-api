const router = require("express").Router();

const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
const ChannelController = require("./controllers/ChannelController");
const MemberController = require("./controllers/MemberController");
const MessageController = require("./controllers/MessageController");
const PostController = require("./controllers/PostController");
const CommentController = require("./controllers/CommentController");

/* -------------------------------------------------------------------------- */
/*                                    USERS                                   */
/* -------------------------------------------------------------------------- */
// router.post("/users/", UserController.register); // rename to addUser
router.use("/sessions", SessionController);
router.use("/users", UserController);
router.use("/channels", ChannelController);
router.use("/members", MemberController);
router.use("/messages", MessageController);
router.use("/posts", PostController);
router.use("/comments", CommentController);
// router.use("/users", UserController.addUser); // rename to addUser
// router.use("/users", UserController.getUser);
// router.put("/users/", UserController.getUser);
// router.delete("/users/", UserController.deleteUser);
// router.use("/users/search", UserController.searchUsers); // /users/search?
/* -------------------------------------------------------------------------- */
/*                                  SESSIONS                                  */
/* -------------------------------------------------------------------------- */
// router.post("/sessions/login", SessionController.login);
// router.post("/sessions/logout", SessionController.logout);
// router.get("/sessions/validate", SessionController.validate);
// /* -------------------------------------------------------------------------- */
// /*                                  CHANNELS                                  */
// /* -------------------------------------------------------------------------- */
// router.use("/channels", require("./channels"));
// /* -------------------------------------------------------------------------- */
// /*                                   MEMBERS                                  */
// /* -------------------------------------------------------------------------- */
// router.use("/members", require("./members"));
// /* -------------------------------------------------------------------------- */
// /*                                  MESSAGES                                  */
// /* -------------------------------------------------------------------------- */
// router.use("/messages", require("./messages"));
// /* -------------------------------------------------------------------------- */
// /*                                    POSTS                                   */
// /* -------------------------------------------------------------------------- */
// router.use("/posts", require("./posts"));
// /* -------------------------------------------------------------------------- */
// /*                                  COMMENTS                                  */
// /* -------------------------------------------------------------------------- */
// router.use("/comments", require("./comments"));
// /* -------------------------------------------------------------------------- */
// /*                                    LIKES                                   */
// /* -------------------------------------------------------------------------- */
// router.use("/likes", require("./likes"));
// /* -------------------------------------------------------------------------- */
// /*                                   VIDEOS                                   */
// /* -------------------------------------------------------------------------- */
// router.use("/videos", require("./videos"));
// /* -------------------------------------------------------------------------- */
// /*                                  WATCHERS                                  */
// /* -------------------------------------------------------------------------- */
// router.use("/watchers", require("./watchers"));

module.exports = router;
