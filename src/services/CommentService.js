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

module.exports.deleteComment = async ({ commentId, userId }) => {
  return db.task(async t => {
    const deletedComment = await t.CommentRepository.deleteComment({
      commentId,
      userId
    });
    const postLastCommentInfo = await t.PostRepository.getPostLastCommentInfo({
      postId: deletedComment.postId
    });
    return { ...deletedComment, ...postLastCommentInfo };
  });
};

module.exports.addCommentLike = async ({ commentId, userId }) => {
  return db.CommentRepository.addCommentLike({
    commentId,
    userId
  });
};

module.exports.deleteCommentLike = async ({ commentId, userId }) => {
  return db.CommentRepository.deleteCommentLike({
    commentId,
    userId
  });
};
