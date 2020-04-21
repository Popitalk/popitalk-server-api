/* eslint-disable class-methods-use-this */
const queries = require("../database/queries");

class PostRepository {
  constructor(db) {
    this.db = db;
  }

  async addPost({ channelId, userId, content, upload }) {
    return this.db.one(queries.addPost, [channelId, userId, content, upload]);
  }

  async getPosts({ channelId, userId, beforePostId }) {
    if (beforePostId)
      return this.db.oneOrNone(queries.getPostsBefore, [
        channelId,
        userId,
        beforePostId
      ]);
    return this.db.oneOrNone(queries.getPosts, [channelId, userId]);
  }

  async deletePost({ postId, userId }) {
    return this.db.one(queries.deletePost, [postId, userId]);
  }

  async addPostLike({ postId, userId }) {
    return this.db.one(queries.addPostLike, [postId, userId]);
  }

  async deletePostLike({ postId, userId }) {
    return this.db.one(queries.deletePostLike, [postId, userId]);
  }

  async getPostLastCommentInfo({ postId }) {
    return this.db.one(queries.getPostLastCommentInfo, [postId]);
  }
}

module.exports = PostRepository;
