const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const responseTime = require("response-time");
const sessionParser = require("../config/sessionParser");
const config = require("../config");
const requestId = require("../helpers/middleware/requestId");
const passport = require("../config/passport");
const errorHandler = require("../helpers/middleware/errorHandler");
const requestLogger = require("../helpers/middleware/requestLogger");

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

  app.use(passport.initialize());
  app.use(passport.session());

  if (config.mode !== "testing") {
    app.use(requestLogger);
  }

  app.use("/api", require("../api"));

  app.use(errorHandler);
};

module.exports = expressLoader;
