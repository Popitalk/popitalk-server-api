module.exports = (req, res, next) => {
  req.payload = {
    ...req.body,
    ...req.params,
    ...req.query,
    ...(req.user && { userId: req.user.id })
  };

  return next();
};
