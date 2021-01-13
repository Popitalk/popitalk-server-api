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

      const { name } = await CategoryService.addCategory({
        category
      });

      return res.response({ category: name }).code(201);
    }
  },
  {
    method: "GET",
    path: "/",
    options: {
      description:
        "Get categories with the count of channels within each category",
      tags: ["api"]
    },
    async handler(req, res) {
      const categories = await CategoryService.getCategories();

      return res.response({ categories });
    }
  },
  {
    method: "GET",
    path: "/top",
    options: {
      description: "Get top categories",
      tags: ["api"]
    },
    async handler(req, res) {
      const categories = await CategoryService.getTopCategories();

      return res.response({ categories });
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
