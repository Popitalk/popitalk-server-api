const { celebrate, Joi } = require("celebrate");

const validator = {
  getUser: celebrate({
    params: Joi.object()
      .keys({
        userId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addUser: celebrate({
    body: Joi.object()
      .keys({
        firstName: Joi.string()
          .min(1)
          .max(50)
          .required(),
        lastName: Joi.string()
          .min(1)
          .max(50)
          .required(),
        username: Joi.string()
          .min(3)
          .max(30)
          .required(),
        dateOfBirth: Joi.date()
          .iso()
          .max(new Date(new Date() - 1000 * 60 * 60 * 24 * 365 * 13))
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string()
          .min(6)
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/\d+/)
          .required()
      })
      .required()
  }),
  searchUsers: celebrate({
    query: Joi.object()
      .keys({
        username: Joi.string()
          .min(1)
          .required()
      })
      .required()
  })
};

module.exports = validator;
