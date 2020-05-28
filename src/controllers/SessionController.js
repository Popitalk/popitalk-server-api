const Joi = require("@hapi/joi");
const Boom = require("@hapi/boom");
const SessionService = require("../services/SessionService");

const loginResponseSchema = Joi.object()
  .keys({
    id: Joi.string()
      .uuid()
      .required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    avatar: Joi.string()
      .uri()
      .allow(null)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    emailVerified: Joi.boolean().required(),
    createdAt: Joi.date().required(),
    channels: Joi.object().required(),
    relationships: Joi.object()
      .keys({
        friends: Joi.array()
          .items(Joi.string().uuid())
          .min(0)
          .required(),
        sentFriendRequests: Joi.array()
          .items(Joi.string().uuid())
          .required(),
        receivedFriendRequests: Joi.array()
          .items(Joi.string().uuid())
          .required(),
        blocked: Joi.array()
          .items(Joi.string().uuid())
          .required(),
        blockers: Joi.array()
          .items(Joi.string().uuid())
          .required()
      })
      .required(),
    users: Joi.object().required()
  })
  .required()
  .label("loginResponse");

const controllers = [
  {
    method: "POST",
    path: "/login",
    options: {
      auth: false,
      description: "Login user",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .keys({
            usernameOrEmail: Joi.string()
              .required()
              .example("user123"),
            password: Joi.string()
              .required()
              .example("PassW0rd")
          })
          .required()
          .label("loginRequest")
      },
      response: {
        status: {
          200: loginResponseSchema
        }
      }
    },
    async handler(req, res) {
      const loginData = await SessionService.login(req.payload);

      if (!loginData)
        throw Boom.unauthorized("Incorrect username or password.");

      const credentials = { id: loginData.id };

      req.yar.set("auth", {
        ...req.auth,
        isAuthenticated: true,
        credentials
      });

      return loginData;
    }
  },
  {
    method: "POST",
    path: "/logout",
    options: {
      description: "Logout user",
      tags: ["api"],
      response: {
        status: {
          204: Joi.object()
            .keys({})
            .required()
            .label("logoutResponse")
        }
      }
    },
    async handler(req, res) {
      req.yar.clear("auth");
      return res.response({}).code(204);
    }
  },
  {
    method: "GET",
    path: "/validate",
    options: {
      description: "Validate Session",
      tags: ["api"],
      response: {
        status: {
          200: loginResponseSchema
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const loginData = await SessionService.getLoginData({ userId });
      console.log("XXX", req.socket);
      return loginData;
    }
  }
];

const SessionController = {
  name: "SessionController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = SessionController;
