const { QueryFile } = require("pg-promise");
const path = require("path");

function sql(file) {
  const fullPath = path.join(__dirname, file);
  const options = { minify: true };
  const qf = new QueryFile(fullPath, options);
  // eslint-disable-next-line no-console
  if (qf.error) console.error(qf.error);
  return qf;
}

module.exports = {
  /* -------------------------------------------------------------------------- */
  /*                                    USERS                                   */
  /* -------------------------------------------------------------------------- */

  addUser: sql("./addUser.sql"),
  getUser: require("./getUser"),
  updateUser: require("./updateUser.js"),
  deleteUser: sql("./deleteUser.sql"),
  searchUsers: sql("./searchUsers.sql"),
  addUserRelationship: sql("./addUserRelationship.sql"),
  getUserRelationship: sql("./getUserRelationship.sql"),
  updateUserRelationship: sql("./updateUserRelationship.sql"),
  deleteUserRelationship: sql("./deleteUserRelationship.sql"),

  /* -------------------------------------------------------------------------- */
  /*                                  SESSIONS                                  */
  /* -------------------------------------------------------------------------- */

  getLoginData: sql("./getLoginData.sql"),

  /* -------------------------------------------------------------------------- */
  /*                                  CHANNELS                                  */
  /* -------------------------------------------------------------------------- */

  addChannel: sql("./addChannel.sql"),
  addRoom: sql("./addRoom.sql"),
  getAdminChannel: sql("./getAdminChannel.sql"),
  getPublicChannel: sql("./getPublicChannel.sql"),
  getPrivateChannel: sql("./getPrivateChannel.sql"),
  getRoomChannel: sql("./getRoomChannel.sql"),
  getChannelAndMemberInfo: sql("./getChannelAndMemberInfo.sql"),
  getChannelLastMessageInfo: sql("./getChannelLastMessageInfo.sql"),
  getChannelLastPostInfo: sql("./getChannelLastPostInfo.sql"),
  updateChannel: require("./updateChannel.js"),
  updatePlayerStatus: require("./updatePlayerStatus.js"),
  getPlayerStatus: require("./getPlayerStatus.js"),
  deleteChannel: sql("./deleteChannel.sql"),
  deleteFriendRoom: sql("./deleteFriendRoom.sql"),

  /* -------------------------------------------------------------------------- */
  /*                                    VIDEOS                                  */
  /* -------------------------------------------------------------------------- */

  addVideo: sql("./addVideo.sql"),
  addChannelVideo: sql("./addChannelVideo.sql"),
  getHasPermission: require("./getHasPermission.js"),

  /* -------------------------------------------------------------------------- */
  /*                                   MEMBERS                                  */
  /* -------------------------------------------------------------------------- */

  addMembers: sql("./addMembers.sql"),
  addPublicMember: sql("./addPublicMember.sql"),
  addPrivateMember: sql("./addPrivateMember.sql"),
  addRoomMember: sql("./addRoomMember.sql"),
  addRoomMembers: sql("./addRoomMembers.sql"),
  deleteGroupRoomMember: sql("./deleteGroupRoomMember.sql"),
  deleteChannelMember: sql("./deleteChannelMember.sql"),
  deleteMember: sql("./deleteMember.sql"),
  addAdmin: sql("./addAdmin.sql"),
  deleteAdmin: sql("./deleteAdmin.sql"),
  addBan: sql("./addBan.sql"),
  deleteBan: sql("./deleteBan.sql"),

  /* -------------------------------------------------------------------------- */
  /*                                  MESSAGES                                  */
  /* -------------------------------------------------------------------------- */

  addMessage: sql("./addMessage.sql"),
  deleteMessage: sql("./deleteMessage.sql"),
  getMessages: require("./getMessages.js"),

  /* -------------------------------------------------------------------------- */
  /*                                    POSTS                                   */
  /* -------------------------------------------------------------------------- */

  addPost: sql("./addPost.sql"),
  deletePost: sql("./deletePost.sql"),
  getPosts: sql("./getPosts.sql"),
  getPostsBefore: sql("./getPostsBefore.sql"),
  // getPosts: require("./getPosts.js"),
  addPostLike: sql("./addPostLike.sql"),
  deletePostLike: sql("./deletePostLike.sql"),
  getPostLastCommentInfo: sql("./getPostLastCommentInfo.sql"),

  /* -------------------------------------------------------------------------- */
  /*                                  COMMENTS                                  */
  /* -------------------------------------------------------------------------- */

  addComment: sql("./addComment.sql"),
  deleteComment: sql("./deleteComment.sql"),
  getComments: sql("./getComments.sql"),
  addCommentLike: sql("./addCommentLike.sql"),
  deleteCommentLike: sql("./deleteCommentLike.sql")

  /* -------------------------------------------------------------------------- */
  /*                                    LIKES                                   */
  /* -------------------------------------------------------------------------- */
};
