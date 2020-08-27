const Joi = require("@hapi/joi");
const { google } = require("googleapis");
const moment = require("moment");
const config = require("../config");
const VideoService = require("../services/VideoService");

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

      const parameters = {
        part: "snippet",
        q: terms,
        maxResults: 25,
        type: "video",
        key: config.youtubeApiKey
      };
      if (page) {
        parameters.pageToken = page;
      }

      try {
        const youtube = google.youtube("v3");
        const response = await youtube.search.list(parameters);

        const results = response.data.items.map(i => {
          return {
            id: i.id.videoId,
            url: `https://www.youtube.com/watch?v=${i.id.videoId}`,
            publishedAt: i.snippet.publishedAt,
            title: i.snippet.title,
            thumbnail: i.snippet.thumbnails.high.url
          };
        });

        return res
          .response({
            nextPageToken: response.data.nextPageToken,
            prevPageToken: response.data.prevPageToken,
            totalResults: response.data.pageInfo.totalResults,
            results
          })
          .code(201);
      } catch (err) {
        return res
          .response({
            error: err
          })
          .code(500);
      }
    }
  },
  {
    method: "GET",
    path: "/queue/{channelId}",
    options: {
      description: "Gets the channel queue",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { channelId } = req.params;
      const queue = await VideoService.getQueue({ channelId });
      return res.response({ queue }).code(201);
    }
  },
  {
    method: "POST",
    path: "/{channelId}",
    options: {
      description: "Adds a video to a channel queue",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            source: Joi.string().required(),
            sourceId: Joi.string().required(),
            length: Joi.number(),
            videoInfo: Joi.string().required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const videoInfo = req.payload;

      try {
        const youtube = google.youtube("v3");
        const response = await youtube.videos.list({
          part: "contentDetails",
          id: videoInfo.sourceId,
          key: config.youtubeApiKey
        });

        const length = response.data.items[0].contentDetails.duration;
        videoInfo.length = moment.duration(length).asSeconds();

        const video = await VideoService.addVideo({
          userId,
          channelId,
          ...videoInfo
        });

        return res.response({ channelId, video }).code(201);
      } catch (err) {
        return res
          .response({
            error: err
          })
          .code(500);
      }
    }
  },
  {
    method: "PUT",
    path: "/{channelId}",
    options: {
      description: "Updates video order in a channel queue",
      tags: ["api"],
      payload: { multipart: { output: "annotated" } },
      plugins: {
        "hapi-swagger": {
          payloadType: "form"
        }
      },
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            oldIndex: Joi.number().required(),
            newIndex: Joi.number().required()
          })
          .required()
      },
      response: {
        status: {
          201: Joi.object()
            .keys({
              channelId: Joi.string()
                .uuid()
                .required(),
              oldIndex: Joi.number().required(),
              newIndex: Joi.number().required()
            })
            .required()
            .label("updateQueueResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const { oldIndex, newIndex } = req.payload;
      const playerStatus = await VideoService.updateQueue({
        userId,
        channelId,
        oldIndex,
        newIndex
      });

      return { channelId, oldIndex, newIndex, updatedChannel: playerStatus };
    }
  },
  {
    method: "DELETE",
    path: "/{channelVideoId}",
    options: {
      description: "Deletes a video from a channel queue",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelVideoId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        payload: Joi.object()
          .keys({
            channelId: Joi.string().required()
          })
          .required()
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelVideoId } = req.params;
      const { channelId } = req.payload;

      const { deletedVideo, playerStatus } = await VideoService.deleteVideo({
        userId,
        channelId,
        channelVideoId
      });

      return { ...deletedVideo, updatedChannel: playerStatus };
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
