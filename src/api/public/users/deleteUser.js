const router = require("express").Router();
const { ApiError, DatabaseError } = require("../../../helpers/errors");
const { invalidateCache } = require("../../../helpers/middleware/cache");
const authenticateUser = require("../../../helpers/middleware/authenticateUser");
const deleteUser = require("../../../database/queries/deleteUser");

router.delete(
  "/",
  // invalidateCache,
  authenticateUser,
  async (req, res, next) => {
    const { id: userId } = req.user;

    try {
      const deletedUser = await deleteUser({ userId });

      if (!deletedUser)
        throw new ApiError(`User with id ${userId} not found`, 404);

      req.logout();
      res.status(204).json({});
    } catch (error) {
      if (error instanceof DatabaseError) {
        next(new ApiError(undefined, undefined, error));
      } else {
        next(error);
      }
    }
  }
);

module.exports = router;
