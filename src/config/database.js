/* eslint-disable no-param-reassign */
const pgPromise = require("pg-promise");
const promise = require("bluebird");
const config = require(".");
const SessionRepository = require("../repositories/SessionRepository");
const UserRepository = require("../repositories/UserRepository");
const ChannelRepository = require("../repositories/ChannelRepository");
const MemberRepository = require("../repositories/MemberRepository");
const MessageRepository = require("../repositories/MessageRepository");
const PostRepository = require("../repositories/PostRepository");
const CommentRepository = require("../repositories/CommentRepository");

promise.config({ longStackTraces: true });

const initOptions = {
  promiseLib: promise,
  extend(obj, dc) {
    obj.SessionRepository = new SessionRepository(obj);
    obj.UserRepository = new UserRepository(obj);
    obj.ChannelRepository = new ChannelRepository(obj);
    obj.MemberRepository = new MemberRepository(obj);
    obj.MessageRepository = new MessageRepository(obj);
    obj.PostRepository = new PostRepository(obj);
    obj.CommentRepository = new CommentRepository(obj);
  }
};

const pgp = pgPromise(initOptions);

const db = pgp({
  host: config.dbHost || "localhost",
  port: config.dbPort || 5432,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword
});

module.exports = db;
