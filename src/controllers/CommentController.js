const Joi = require("@hapi/joi");
const { USER_CHANNEL_EVENTS, CHANNEL_EVENTS } = require("../config/constants");
const { publisher } = require("../config/pubSub");
const CommentService = require("../services/CommentService");

const commentSchema = Joi.object().keys({
  id: Joi.string()
    .uuid()
    .required(),
  postId: Joi.string()
    .uuid()
    .required(),
  userId: Joi.string()
    .uuid()
    .required(),
  content: Joi.string()
    .min(1)
    .max(2000)
    .required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  channelId: Joi.string()
    .uuid()
    .required(),
  author: {
    id: Joi.string()
      .uuid()
      .required(),
    username: Joi.string().required(),
    avatar:
      "https://playnows.s3.amazonaws.com/avatar-9bcde2c0-faf9-4773-9a4c-e431837bb08f_1587026280984.jpg"
  },
  likeCount: Joi.number().required(),
  liked: Joi.boolean().required(),
  selfCommentCount: Joi.number().required()
});

const commentSchemaGet = Joi.object().keys({
  id: Joi.string()
    .uuid()
    .required(),
  postId: Joi.string()
    .uuid()
    .required(),
  userId: Joi.string()
    .uuid()
    .required(),
  content: Joi.string()
    .min(1)
    .max(2000)
    .required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  author: {
    id: Joi.string()
      .uuid()
      .required(),
    username: Joi.string().required(),
    avatar:
      "https://playnows.s3.amazonaws.com/avatar-9bcde2c0-faf9-4773-9a4c-e431837bb08f_1587026280984.jpg"
  },
  likeCount: Joi.number().required(),
  liked: Joi.boolean().required()
});

const likeSchema = Joi.object()
  .keys({
    commentId: Joi.string()
      .uuid()
      .required(),
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
      description: "Adds comment",
      tags: ["api"],
      validate: {
        payload: Joi.object()
          .keys({
            postId: Joi.string()
              .uuid()
              .required(),
            content: Joi.string()
              .min(1)
              .max(2000)
          })
          .required()
      },
      response: {
        status: {
          201: commentSchema.required().label("addCommentResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const addedComment = await CommentService.addComment({
        userId,
        ...req.payload
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_ADD_COMMENT,
      //   channelId: addedComment.channelId,
      //   initiator: userId,
      //   payload: addedComment
      // });
      return res.response(addedComment).code(201);
    }
  },
  {
    method: "GET",
    path: "/{postId}",
    options: {
      description: "Gets comments",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            postId: Joi.string()
              .uuid()
              .required()
          })
          .required(),
        query: Joi.object()
          .keys({
            limit: Joi.number()
              .integer()
              .positive()
              .multiple(3)
              .optional()
          })
          .optional()
      },
      response: {
        status: {
          200: Joi.array()
            .items(commentSchemaGet)
            .required()
            .label("getCommentsResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const comments = await CommentService.getComments({
        userId,
        ...req.params,
        ...req.query
      });

      return comments;
    }
  },
  {
    method: "DELETE",
    path: "/{commentId}",
    options: {
      description: "Deletes comment",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            commentId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      },
      response: {
        status: {
          200: Joi.object()
            .keys({
              id: Joi.string()
                .uuid()
                .required(),
              postId: Joi.string()
                .uuid()
                .required(),
              channelId: Joi.string()
                .uuid()
                .required(),
              firstCommentId: Joi.string()
                .uuid()
                .required(),
              lastCommentId: Joi.string()
                .uuid()
                .required(),
              lastCommentAt: Joi.date()
                .iso()
                .required()
            })
            .required()
            .label("deleteCommentResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { commentId } = req.params;
      const deletedComment = await CommentService.deleteComment({
        userId,
        commentId
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_DELETE_COMMENT,
      //   channelId: deletedComment.channelId,
      //   initiator: userId,
      //   payload: {
      //     userId,
      //     channelId: deletedComment.channelId,
      //     ...deletedComment
      //   }
      // });
      return deletedComment;
    }
  },
  {
    method: "POST",
    path: "/{commentId}/likes",
    options: {
      description: "Adds comment like",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            commentId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      },
      response: {
        status: {
          201: likeSchema.label("addCommentLikeResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { commentId } = req.params;
      const newLike = await CommentService.addCommentLike({
        userId,
        commentId
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_ADD_COMMENT_LIKE,
      //   channelId: newLike.channelId,
      //   initiator: userId,
      //   payload: newLike
      // });
      return res.response(newLike).code(201);
    }
  },
  {
    method: "DELETE",
    path: "/{commentId}/likes",
    options: {
      description: "Deletes comment like",
      tags: ["api"],
      validate: {
        params: Joi.object()
          .keys({
            commentId: Joi.string()
              .uuid()
              .required()
          })
          .required()
      },
      response: {
        status: {
          200: likeSchema.label("deleteCommentLikeResponse")
        }
      }
    },
    async handler(req, res) {
      const { id: userId } = req.auth.credentials;
      const { commentId } = req.params;
      const deletedLike = await CommentService.deleteCommentLike({
        userId,
        commentId
      });
      // publisher({
      //   type: CHANNEL_EVENTS.WS_DELETE_COMMENT_LIKE,
      //   channelId: deletedLike.channelId,
      //   initiator: userId,
      //   payload: deletedLike
      // });
      return deletedLike;
    }
  }
];

const CommentController = {
  name: "CommentController",
  version: "1.0.0",
  async register(server, options) {
    server.route(controllers);
  }
};

module.exports = CommentController;