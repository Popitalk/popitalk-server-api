const db = require("../config/database");

module.exports.addPost = async ({ userId, channelId, content }) => {
  return db.PostRepository.addPost({ userId, channelId, content });
};

module.exports.getPosts = async ({ channelId, userId, beforePostId }) => {
  return db.PostRepository.getPosts({
    channelId,
    userId,
    beforePostId
  });
};

module.exports.deletePost = async ({ postId, userId }) => {
  return db.t(async t => {
    const deletedPost = await t.PostRepository.deletePost({
      postId,
      userId
    });
    const channelLastPostInfo = await t.ChannelRepository.getChannelLastPostInfo(
      { channelId: deletedPost.channelId }
    );
    return { ...deletedPost, ...channelLastPostInfo };
  });
};

module.exports.addPostLike = async ({ postId, userId }) => {
  return db.PostRepository.addPostLike({
    postId,
    userId
  });
};

module.exports.deletePostLike = async ({ postId, userId }) => {
  return db.PostRepository.deletePostLike({
    postId,
    userId
  });
};
