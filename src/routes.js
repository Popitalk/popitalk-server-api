const router = require("express").Router();

const UserController = require("./controllers/UserController");

/* -------------------------------------------------------------------------- */
/*                                    USERS                                   */
/* -------------------------------------------------------------------------- */
// router.post("/users/", UserController.register); // rename to addUser
router.use("/users", UserController.addUser); // rename to addUser
router.use("/users", UserController.getUser);
// router.put("/users/", UserController.getUser);
// router.delete("/users/", UserController.deleteUser);
router.use("/users/search", UserController.searchUsers); // /users/search?
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
