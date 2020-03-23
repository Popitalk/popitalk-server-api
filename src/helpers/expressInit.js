const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const YAML = require("yamljs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const sessionParser = require("../config/sessionParser");
const config = require("../config");
const requestId = require("./middleware/requestId");
// const passport = require("../config/passport");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const routes = require("../routes");
// const swag = require("../config/swagger2.yml");
const yamlPath = path.resolve(__dirname, "../config/swagger2.yml");
// const swaggerDocument = YAML.load(yamlPath);
const swaggerDocument = require("../config/swagger");

const expressLoader = app => {
  if (config.mode === "development") {
    app.use(express.static("./public"));
  }

  if (config.mode === "production") {
    app.set("trust proxy", "loopback");

    // app.use(
    //   cors({
    //     origin(origin, cb) {
    //       const whitelist = config.corsOrigin ? config.corsOrigin.split(",") : [];
    //       if (whitelist.indexOf(origin) !== -1) {
    //         cb(null, true);
    //       } else {
    //         cb(new Error("Not allowed by CORS"));
    //       }
    //     },
    //     credentials: true
    //   })
    // );
  } else {
    app.use(cors());
  }
  app.use(responseTime());
  app.use(requestId());

  app.use(express.json());
  // app.use(express.urlencoded({ extended: false }));

  app.use(cookieParser());
  // if (config.mode !== "testing") {
  app.use(sessionParser);
  // }
  if (config.mode === "production") {
    app.use(helmet());
  }

  // app.use(passport.initialize());
  // app.use(passport.session());

  if (config.mode !== "testing") {
    app.use(requestLogger);
  }

  const options = {
    customCss: ".swagger-ui .topbar { display: none }"
  };

  app.use("/api", routes);
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, options)
  );
  // asyncHandler(async (req, res, next) => {
  //   UserController.getUser();
  // })
  // app.use("/api", routes);

  app.use(errorHandler);
};

module.exports = expressLoader;
