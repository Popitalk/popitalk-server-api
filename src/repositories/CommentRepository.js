/* eslint-disable class-methods-use-this */
const queries = require("../database/queries");

class CommentRepository {
  constructor(db) {
    this.db = db;
  }

  async addComment({ postId, userId, content }) {
    return this.db.one(queries.addComment, [postId, userId, content]);
  }

  async getComments({ postId, userId, limit = 3 }) {
    return this.db.any(queries.getComments, [postId, userId, limit]);
  }

  async deleteComment({ commentId, userId }) {
    return this.db.one(queries.deleteComment, [commentId, userId]);
  }

  async addCommentLike({ commentId, userId }) {
    return this.db.one(queries.addCommentLike, [commentId, userId]);
  }

  async deleteCommentLike({ commentId, userId }) {
    return this.db.one(queries.deleteCommentLike, [commentId, userId]);
  }
}

module.exports = CommentRepository;
