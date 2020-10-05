const Joi = require("@hapi/joi");
const { WS_EVENTS } = require("../config/constants");
const publisher = require("../config/publisher");
const PostService = require("../services/PostService");

const postSchema = Joi.object().keys({
  id: Joi.string()
    .uuid()
    .required(),
  channelId: Joi.string()
    .uuid()
    .required(),
  userId: Joi.string()
    .uuid()
    .required(),
  content: Joi.string()
    .min(1)
    .max(20000)
    .required(),
  upload: Joi.string()
    .uri()
    .allow(null)
    .required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  author: Joi.object()
    .keys({
      id: Joi.string()
        .uuid()
        .required(),
      username: Joi.string().required(),
      avatar: Joi.string()
        .uri()
        .allow(null)
        .required()
    })
    .required(),
  likeCount: Joi.number().required(),
  liked: Joi.boolean().required(),
  commentCount: Joi.number().required(),
  selfCommentCount: Joi.number().required(),
  firstCommentId: Joi.string()
    .uuid()
    .allow(null)
    .required(),
  lastCommentId: Joi.string()
    .uuid()
    .allow(null)
    .required(),
  lastCommentAt: Joi.date()
    .iso()
    .allow(null)
    .required()
});

const likeSchema = Joi.object()
  .keys({
    postId: Joi.string()
      .uuid()
      .required(),
    userId: Joi.string()
      .uuid()
      .required(),
    channelId: Joi.string()
      .uuid()
      .required()
  })
  .required();

const controllers = [
  {
    method: "POST",
    path: "/",
    options: {
      description: "Adds post",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required(),
            content: Joi.string()
              .min(1)
              .max(20000),
            upload: Joi.string()
              .allow(null)
              .default(null)
              .optional()
          })
          .required()
      }
      // response: {
      //   status: {
      //     201: postSchema.required().label("addPostResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId, content, upload } = req.payload;
      const newPost = await PostService.addPost({
        userId,
        channelId,
        content,
        upload
      });

      const response = { ...newPost, channelId };

      publisher({
        type: WS_EVENTS.CHANNEL.ADD_POST,
        channelId,
        initiator: userId,
        payload: response
      });

      return res.response(response).code(201);
    }
  },
  {
    method: "GET",
    path: "/{channelId}",
    options: {
      description: "Gets channel posts",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            channelId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        query: Joi.object()
          .keys({
            afterPostId: Joi.string()
              .uuid()
              .optional(),
            beforePostId: Joi.string()
              .uuid()
              .optional()
          })
          .optional()
      }
      // response: {
      //   status: {
      //     200: Joi.object()
      //       .keys({
      //         channelId: Joi.string()
      //           .uuid()
      //           .required(),
      //         posts: Joi.array()
      //           .items(postSchema)
      //           .required(),
      //         comments: Joi.object().required()
      //       })
      //       .required()
      //       .label("getPostsResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { channelId } = req.params;
      const { afterPostId, beforePostId } = req.query;
      const posts = await PostService.getPosts({
        userId,
        channelId,
        afterPostId,
        beforePostId
      });

      return { ...posts, channelId, afterPostId, beforePostId };
    }
  },
  {
    method: "DELETE",
    path: "/{postId}",
    options: {
      description: "Deletes post",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            postId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
      // response: {
      //   status: {
      //     200: Joi.object()
      //       .keys({
      //         id: Joi.string()
      //           .uuid()
      //           .required(),
      //         channelId: Joi.string()
      //           .uuid()
      //           .required(),
      //         firstPostId: Joi.string()
      //           .uuid()
      //           .required(),
      //         lastPostId: Joi.string()
      //           .uuid()
      //           .required(),
      //         lastPostAt: Joi.date()
      //           .iso()
      //           .required()
      //       })
      //       .required()
      //       .label("deletePostResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { postId } = req.params;
      const deletedPost = await PostService.deletePost({ userId, postId });

      const response = deletedPost;

      publisher({
        type: WS_EVENTS.CHANNEL.DELETE_POST,
        channelId: deletedPost.channelId,
        initiator: userId,
        payload: response
      });

      return response;
    }
  },
  {
    method: "POST",
    path: "/{postId}/likes",
    options: {
      description: "Adds post like",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            postId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
      // response: {
      //   status: {
      //     201: likeSchema.label("addPostLikeResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { postId } = req.params;
      const newLike = await PostService.addPostLike({ userId, postId });

      const response = newLike;

      publisher({
        type: WS_EVENTS.CHANNEL.ADD_POST_LIKE,
        channelId: newLike.channelId,
        initiator: userId,
        payload: response
      });

      return res.response(response).code(201);
    }
  },
  {
    method: "DELETE",
    path: "/{postId}/likes",
    options: {
      description: "Deletes post like",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            postId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      }
      // response: {
      //   status: {
      //     200: likeSchema.label("deletePostLikeResponse")
      //   }
      // }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { postId } = req.params;
      const deletedLike = await PostService.deletePostLike({ userId, postId });

      const response = deletedLike;

      publisher({
        type: WS_EVENTS.CHANNEL.DELETE_POST_LIKE,
        channelId: deletedLike.channelId,
        initiator: userId,
        payload: response
      });

      return response;
    }
  }
];

const PostController = {
  name: "PostController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = PostController;
