const db = require("../config/database");

module.exports.addComment = async ({ postId, userId, content }) => {
  return db.CommentRepository.addComment({ postId, userId, content });
};

module.exports.getComments = async ({ postId, userId, limit }) => {
  return db.CommentRepository.getComments({
    postId,
    userId,
    limit
  });
};

module.exports.deleteComment = async ({ postId, userId }) => {
  return db.t(async t => {
    const deletedPost = await t.CommentRepository.deleteComment({
      postId,
      userId
    });
    const channelLastPostInfo = await t.ChannelRepository.getChannelLastPostInfo(
      { channelId: deletedPost.channelId }
    );
    return { ...deletedPost, ...channelLastPostInfo };
  });
};

module.exports.addCommentLike = async ({ commentId, userId }) => {
  return db.PostRepository.addCommentLike({
    commentId,
    userId
  });
};

module.exports.deleteCommentLike = async ({ commentId, userId }) => {
  return db.PostRepository.deleteCommentLike({
    commentId,
    userId
  });
};
