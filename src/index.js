const Hapi = require("@hapi/hapi");
const Boom = require("@hapi/boom");
const localStrategy = require("@hapi/basic");
const config = require("./config");
const logger = require("./config/logger");

if (config.mode !== "production") {
  require("./helpers/createProjectDirectories");
}

const users = {
  john: {
    username: "john",
    password: "password", // 'secret'
    name: "John Doe",
    id: "2133d32a"
  }
};

const validate = async (request, username, password, h) => {
  console.log("VALIDATING");

  const user = users[username];
  if (!user) {
    return { credentials: null, isValid: false };
  }

  const isValid = password === users[username].password;
  const credentials = { id: user.id, name: user.name };

  return { isValid, credentials };
};

const init = async () => {
  const server = Hapi.server({
    host: config.host || "localhost",
    port: config.port || 4000
  });

  await server.register(localStrategy);
  server.auth.strategy("simple", "basic", { validate });
  server.auth.default("simple");

  server.route({
    method: "GET",
    path: "/{channelId}",
    handler: async (req, res) => {
      const { channelId } = req.params;

      // req.log("lol");
      // console.log("YES!!!");
      throw Boom.notAcceptable("NO");
      return res.response({ channelId, userId: channelId }).code(201);
    }
  });

  server.ext("onPreResponse", (req, res) => {
    // console.log("XXX", req.dsdsfd);
    // logger.info(`RESPONSE TIME: ${req.info.responded}`);
    // logger.info(req.info.id);
    // const { response } = req;
    // if (!response.isBoom) {
    //   return res.continue;
    // }
    // logger.error(response);
    return res.continue;
  });

  server.events.on("response", (req, res) => {
    logger.info(`RESPONSE TIME: ${req.info.responded}`);
    logger.info(req.info.id);
    // const { response } = req;
    console.log(req.preResponses);
    // if (!response.isBoom) {
    // return res.continue;
    // }
    // logger.error(response);
  });

  // server.events.on("log", (event, tags) => {
  //   logger.info("SERVERLOG");
  // });

  // server.events.on("request", (event, tags) => {
  //   logger.info("RRR");
  // });

  await server.start();
  logger.info(`Server is running on ${server.info.uri} in ${config.mode} mode`);
};

process.on("unhandledRejection", err => {
  logger.info(err);
  process.exit(1);
});

init();
