const Joi = require("@hapi/joi");
const {google} = require('googleapis');
const config = require('../config');

const controllers = [
  {
    method: "GET",
    path: "/search",
    options: {
      description: "Search for videos",
      tags: ["api"],
      validate: {
        query: Joi.object()
          .keys({
            source: Joi.string().required(),
            terms: Joi.string().required(),
            page: Joi.string()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { terms, page } = req.query;
      
      let parameters = {
        part: 'snippet',
        q: terms,
        maxResults: 25,
        type: 'video',
        key: config.youtubeApiKey
      };
      if (page) {
        parameters.pageToken = page;
      }

      try {
        const youtube = google.youtube('v3');
        const response = await youtube.search.list(parameters);

        const results = response.data.items.map(i => {
          return {
            id: i.id.videoId,
            url: `https://www.youtube.com/watch?v=${i.id.videoId}`,
            publishedAt: i.snippet.publishedAt,
            title: i.snippet.title,
            thumbnail: i.snippet.thumbnails.high.url
          }
        });

        return res
          .response({
            nextPageToken: response.data.nextPageToken,
            prevPageToken: response.data.prevPageToken,
            totalResults: response.data.pageInfo.totalResults,
            results: results
          })
          .code(201);
      } catch(err) {
        return res
          .response({
            error: err
          })
          .code(500);
      }
    }
  }
];

const VideoController = {
  name: "VideoController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = VideoController;