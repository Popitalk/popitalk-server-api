const Joi = require("@hapi/joi");

const CategoryService = require("../services/CategoryService");

const controllers = [
  {
    method: "POST",
    path: "/",
    options: {
      description: "Create category",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .required()
          .keys({
            category: Joi.string().required()
          })
      }
    },
    async handler(req, res) {
      const { category } = req.payload;

      const { id, name } = await CategoryService.addCategory({
        category
      });

      return res.response({ id, name }).code(201);
    }
  }
];

const CategoryController = {
  name: "CategoryController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = CategoryController;
