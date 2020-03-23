const { celebrate, Joi } = require("celebrate");

const validator = {
  /* -------------------------------------------------------------------------- */
  /*                                    USERS                                   */
  /* -------------------------------------------------------------------------- */

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
  getUser: celebrate({
    params: Joi.object()
      .keys({
        userId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  updateUser: celebrate({
    body: Joi.object()
      .keys({
        firstName: Joi.string()
          .min(1)
          .max(50)
          .optional(),
        lastName: Joi.string()
          .min(1)
          .max(50)
          .optional(),
        dateOfBirth: Joi.date()
          .iso()
          .max(new Date(new Date() - 1000 * 60 * 60 * 24 * 365 * 13))
          .optional(),
        email: Joi.string()
          .email()
          .optional(),
        password: Joi.string().optional(),
        newPassword: Joi.string()
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/\d+/)
          .disallow(Joi.ref("password"))
          .optional(),
        removeAvatar: Joi.boolean().optional()
      })
      .with("firstName", "password")
      .with("lastName", "password")
      .with("email", "password")
      .with("dateOfBirth", "password")
      .with("removeAvatar", "password")
      .with("newPassword", "password")
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
  }),
  sendFriendRequest: celebrate({
    body: Joi.object()
      .keys({
        requesteeId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  cancelFriendRequest: celebrate({
    params: Joi.object()
      .keys({
        requesteeId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  rejectFriendRequest: celebrate({
    params: Joi.object()
      .keys({
        requesterId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  acceptFriendRequest: celebrate({
    body: Joi.object()
      .keys({
        requesterId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  deleteFriend: celebrate({
    params: Joi.object()
      .keys({
        friendId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addBlock: celebrate({
    body: Joi.object()
      .keys({
        blockedId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  deleteBlock: celebrate({
    params: Joi.object()
      .keys({
        blockedId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),

  /* -------------------------------------------------------------------------- */
  /*                                   MEMBERS                                  */
  /* -------------------------------------------------------------------------- */
  addMember: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  deleteMember: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addAdmin: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        adminId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  deleteAdmin: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        adminId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addBan: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        bannedId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  deleteBan: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        bannedId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  /* -------------------------------------------------------------------------- */
  /*                                  CHANNELS                                  */
  /* -------------------------------------------------------------------------- */

  addChannel: celebrate({
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(3)
          .max(20)
          .required(),
        description: Joi.string()
          .min(1)
          .max(150)
          .required(),
        public: Joi.boolean().required()
      })
      .required()
  }),
  getChannel: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  updateChannel: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    body: Joi.object()
      .keys({
        name: Joi.string()
          .min(3)
          .max(20)
          .optional(),
        description: Joi.string()
          .min(0)
          .max(150)
          .optional(),
        public: Joi.boolean().optional(),
        removeIcon: Joi.boolean().optional()
      })
      .optional()
  }),
  deleteChannel: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  /* -------------------------------------------------------------------------- */
  /*                                  MESSAGES                                  */
  /* -------------------------------------------------------------------------- */
  addMessage: celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(2000)
      })
      .required()
  }),
  getMessages: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    query: Joi.object()
      .keys({
        afterMessageId: Joi.string()
          .uuid()
          .optional(),
        beforeMessageId: Joi.string()
          .uuid()
          .optional()
      })
      .optional()
  }),
  deleteMessage: celebrate({
    params: Joi.object()
      .keys({
        messageId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  /* -------------------------------------------------------------------------- */
  /*                                    POSTS                                   */
  /* -------------------------------------------------------------------------- */
  addPost: celebrate({
    body: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(20000)
      })
      .required()
  }),
  getPosts: celebrate({
    params: Joi.object()
      .keys({
        channelId: Joi.string()
          .uuid()
          .required()
      })
      .required(),
    query: Joi.object()
      .keys({
        beforePostId: Joi.string()
          .uuid()
          .optional()
      })
      .optional()
  }),
  deletePost: celebrate({
    params: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addPostLike: celebrate({
    params: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),

  /* -------------------------------------------------------------------------- */
  /*                                  COMMENTS                                  */
  /* -------------------------------------------------------------------------- */

  addComment: celebrate({
    body: Joi.object()
      .keys({
        postId: Joi.string()
          .uuid()
          .required(),
        content: Joi.string()
          .min(1)
          .max(2000)
      })
      .required()
  }),
  getComments: celebrate({
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
          .optional()
      })
      .optional()
  }),
  deleteComment: celebrate({
    params: Joi.object()
      .keys({
        commentId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  }),
  addCommentLike: celebrate({
    params: Joi.object()
      .keys({
        commentId: Joi.string()
          .uuid()
          .required()
      })
      .required()
  })
};

module.exports = validator;
