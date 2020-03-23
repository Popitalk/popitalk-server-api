const { isEmpty } = require("lodash");
const logger = require("../../config/logger");
const { mode } = require("../../config");

module.exports = (req, res, next) => {
  res.on("finish", () => {
    if (mode !== "development") {
      logger.info({
        req: {
          id: req.id,
          remoteAddress: req.ip,
          url: req.originalUrl,
          method: req.method,
          body: req.body,
          query: req.query,
          params: req.params,
          user: req.user,
          headers: req.headers
        },
        res: {
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.getHeaders()
        },
        ...(req.err && {
          err: req.err
        })
      });
    } else {
      logger.info({
        endpoint: `${req.method}: ${req.originalUrl}`,
        ...(req.body &&
          !isEmpty(req.body) && {
            body: req.body
          }),
        ...(req.query &&
          !isEmpty(req.query) && {
            query: req.query
          }),
        ...(req.params &&
          !isEmpty(req.params) && {
            params: req.params
          }),
        ...(req.user &&
          !isEmpty(req.user) && {
            user: req.user
          }),
        response: `${res.statusCode} ${res.statusMessage} ${
          res.getHeaders()["x-response-time"]
        }`,
        ...(req.err && {
          err: req.err
        })
      });
    }
  });

  next();
};
