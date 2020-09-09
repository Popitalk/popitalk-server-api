const config = require("./config");
const validationFailAction = require("./helpers/validationFailAction");

const apiPrefix = "/api";

const manifest = {
  server: {
    port: config.port || 4000,
    host: config.host || "localhost",
    cache: [
      {
        name: "redisCache",
        provider: {
          constructor: require("@hapi/catbox-redis"),
          options: {
            partition: "playnows_cache",
            host: config.redisHost || "localhost",
            port: config.redisPort || 6379,
            db: config.redisIndex || 0,
            password: config.redisPassword || undefined
          }
        }
      }
    ],
    routes: {
      cors: true,
      // cors: config.mode === "production" ? { origin: [1, 2, 3] } : true,
      security: false,
      // security:
      //   config.mode === "production"
      //     ? {
      //         hsts: false,
      //         xss: true,
      //         noOpen: true,
      //         noSniff: true,
      //         xframe: false
      //       }
      //     : false,
      timeout: { server: 10000 },
      auth: { strategies: ["simple"] },
      log: { collect: true },
      validate: {
        options: { abortEarly: false },
        failAction: validationFailAction
      },
      response: { sample: config.mode === "development" ? 100 : 25 }
    }
  },
  register: {
    plugins: [
      {
        plugin: require("@hapi/yar"),
        options: {
          name: config.sessionName || "S3SS10N",
          maxCookieSize: 0,
          storeBlank: false,
          cache: { cache: "redisCache", expiresIn: 604800000 },
          cookieOptions: {
            isSecure: false,
            // isSecure: config.mode === "production",
            password:
              config.sessionPassword || "really_really_long_session_password",
            ttl: 864000000
          }
        }
      },
      { plugin: require("@hapi/inert") },
      { plugin: require("@hapi/vision") },
      { plugin: require("./plugins/auth") },
      { plugin: require("./plugins/centralLogger") },
      {
        plugin: require("hapi-swagger"),
        options: {
          basePath: apiPrefix,
          pathPrefixSize: 2,
          documentationPath: `${apiPrefix}/docs`,
          jsonPath: `${apiPrefix}/swagger.json`,
          uiCompleteScript:
            "document.getElementsByClassName('topbar')[0].style.display = 'none';",
          info: {
            title: "Playnows API Documentation",
            version: require("../package.json").version
          }
        }
      },
      { plugin: require("./plugins/responseTime") },
      {
        plugin: require("./controllers/UserController"),
        routes: { prefix: `${apiPrefix}/users` }
      },
      {
        plugin: require("./controllers/SessionController"),
        routes: { prefix: `${apiPrefix}/sessions` }
      },
      {
        plugin: require("./controllers/ChannelController"),
        routes: { prefix: `${apiPrefix}/channels` }
      },
      {
        plugin: require("./controllers/MemberController"),
        routes: { prefix: `${apiPrefix}/members` }
      },
      {
        plugin: require("./controllers/MessageController"),
        routes: { prefix: `${apiPrefix}/messages` }
      },
      {
        plugin: require("./controllers/GifController"),
        routes: { prefix: `${apiPrefix}/gifs` }
      },
      {
        plugin: require("./controllers/PostController"),
        routes: { prefix: `${apiPrefix}/posts` }
      },
      {
        plugin: require("./controllers/CommentController"),
        routes: { prefix: `${apiPrefix}/comments` }
      },
      {
        plugin: require("./controllers/VideoController"),
        routes: { prefix: `${apiPrefix}/videos` }
      }
    ]
  }
};

module.exports = manifest;
