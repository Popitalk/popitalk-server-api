const Boom = require("@hapi/boom");
const bcrypt = require("bcryptjs");
const fileType = require("file-type");
const { uploadFile } = require("../config/aws");
const db = require("../config/database");

// addPublicMember for public channel members
// addPrivateMember for private channel members
// addRoomMember for group room members

module.exports.addMember = async ({ channelId, userId }) => {
  return db.MemberRepository.addPublicMember({ channelId, userId });
};

module.exports.deleteMember = async ({ channelId, userId }) => {
  return db.MemberRepository.deleteChannelMember({ channelId, userId });
};

module.exports.addAdmin = async ({ channelId, fromUser, toUser }) => {
  return db.MemberRepository.addAdmin({ channelId, fromUser, toUser });
};
module.exports.deleteAdmin = async ({ channelId, fromUser, toUser }) => {
  return db.MemberRepository.deleteAdmin({ channelId, fromUser, toUser });
};
module.exports.addBan = async ({ channelId, fromUser, toUser }) => {
  return db.MemberRepository.addBan({ channelId, fromUser, toUser });
};
module.exports.deleteBan = async ({ channelId, fromUser, toUser }) => {
  return db.MemberRepository.deleteBan({ channelId, fromUser, toUser });
};
