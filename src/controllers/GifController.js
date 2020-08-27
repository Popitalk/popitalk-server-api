const Joi = require("@hapi/joi");
const config = require("../config");
const fetch = require("node-fetch");

// const messageSchema = Joi.object().keys({
//   id: Joi.string()
//     .uuid()
//     .required(),
//   channelId: Joi.string()
//     .uuid()
//     .required(),
//   userId: Joi.string()
//     .uuid()
//     .required(),
//   content: Joi.string()
//     .min(1)
//     .max(2000)
//     .required(),
//   upload: Joi.string()
//     .allow(null)
//     .required(),
//   createdAt: Joi.date()
//     .iso()
//     .required(),
//   author: Joi.object()
//     .keys({
//       id: Joi.string()
//         .uuid()
//         .required(),
//       username: Joi.string().required(),
//       avatar: Joi.string()
//         .uri()
//         .allow(null)
//         .required()
//     })
//     .required()
// });

const controllers = [
  {
    method: "GET",
    path: "/trending/{offset}",
    options: {
      description: "Get trending gifs",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            offset: Joi.number().required()
          })
          .required()
      },
      response: {
        status: {
          200: Joi.array()
            .required()
            .label("getTrendingGifs")
        }
      }
    },
    async handler(req, res) {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${config.giphyApiKey}&limit=10&offset=${req.params.offset}&rating=pg-13`
      );
      const trendingGifs = await response.json();
      return trendingGifs.data;
      //   return [{ success: "success" }];
    }
  }
];

const GifController = {
  name: "GifController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = GifController;
