const session = require("express-session");
const RedisStore = require("connect-redis");
const { sessionName, sessionSecret, sessionPrefix } = require(".");
const redis = require("./redis");

const sessionParser = session({
  name: sessionName || "S3SS10N",
  secret: sessionSecret || "S34KR1T",
  resave: true,
  saveUninitialized: false,
  store: new (RedisStore(session))({
    client: redis,
    prefix: (sessionPrefix && `${sessionPrefix}:`) || "sess:"
  })
});

module.exports = sessionParser;
