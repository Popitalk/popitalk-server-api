const Boom = require("@hapi/boom");
const fileType = require("file-type");
const { uploadFile } = require("../config/aws");
const db = require("../config/database");

module.exports.addChannel = async ({
  userId,
  name,
  description,
  public: publicChannel,
  icon
}) => {
  return db.tx(async tx => {
    let uploadedIcon;

    if (icon) {
      const { payload: buffer } = icon;
      const type = fileType(buffer);
      const fileName = `channelIcon-${userId}_${new Date().getTime()}`;
      const uploadedImage = await uploadFile(buffer, fileName, type);
      if (!uploadedImage) throw Boom.internal("Couldn't upload icon");
      uploadedIcon = uploadedImage.Location;
    }

    const newChannel = await tx.ChannelRepository.addChannel({
      ownerId: userId,
      name,
      description,
      public: publicChannel,
      icon: uploadedIcon
    });

    await tx.MemberRepository.addMember({
      channelId: newChannel.id,
      userId,
      admin: true
    });

    const channelInfo = await tx.ChannelRepository.getAdminChannel({
      channelId: newChannel.id,
      userId
    });

    return channelInfo;
  });
};

module.exports.addRoom = async ({ userId, userIds }) => {
  return db.tx(async tx => {
    const newChannel = await tx.ChannelRepository.addGroupRoom();
    await tx.MemberRepository.addMembers({
      channelId: newChannel.id,
      userIds: [userId, ...userIds]
    });

    const channelInfo = await tx.ChannelRepository.getRoomChannel({
      channelId: newChannel.id
    });

    return channelInfo;
  });
};

module.exports.getChannel = async ({ channelId, userId }) => {
  return db.task(async t => {
    let channelInfo;
    const chMemInfo = await t.ChannelRepository.getChannelAndMemberInfo({
      channelId,
      userId
    });
    const { type, isPublic, isOwner, isAdmin, isMember, isBanned } = chMemInfo;

    if (isBanned) throw Boom.unauthorized("You're banned from this channel");

    if (type !== "channel" && isMember) {
      channelInfo = await t.ChannelRepository.getRoomChannel({ channelId });
    } else if (isAdmin) {
      channelInfo = await t.ChannelRepository.getAdminChannel({
        channelId,
        userId
      });
    } else if (isMember || isPublic) {
      channelInfo = await t.ChannelRepository.getPublicChannel({
        channelId,
        userId
      });
    } else if (!isMember && !isPublic) {
      channelInfo = await t.ChannelRepository.getPrivateChannel({ channelId });
    }

    const queue = await t.VideoRepository.getChannelQueue({ channelId });
    const transformedQueue = queue.map(v => {
      const { videoInfo, ...minVideo } = v;

      return {
        ...videoInfo,
        ...minVideo
      };
    });

    return {
      ...channelInfo,
      ...chMemInfo,
      queue: transformedQueue
    };
  });
};

module.exports.updateChannel = async ({
  channelId,
  userId,
  name,
  description,
  public: publicChannel,
  icon,
  removeIcon
}) => {
  let uploadedIcon;

  if (icon) {
    const { payload: buffer } = icon;
    const type = fileType(buffer);
    const fileName = `icon-${userId}_${new Date().getTime()}`;
    const uploadedImage = await uploadFile(buffer, fileName, type);
    if (!uploadedImage) throw Boom.internal("Couldn't upload avatar");
    uploadedIcon = uploadedImage.Location;
  }

  const updatedChannel = await db.ChannelRepository.updateChannel({
    channelId,
    userId,
    name,
    description,
    public: publicChannel,
    icon: uploadedIcon,
    removeIcon
  });

  return updatedChannel;
};

module.exports.updatePlayerStatus = async newPlayerStatus => {
  return db.tx(async tx => {
    await tx.VideoRepository.getHasPermission({
      userId: newPlayerStatus.userId,
      channelId: newPlayerStatus.channelId
    });

    let playerStatus = null;
    if (!newPlayerStatus.status) {
      playerStatus = await tx.ChannelRepository.getPlayerStatus({
        channelId: newPlayerStatus.channelId
      });
      newPlayerStatus.status = playerStatus.status;
    }

    playerStatus = await tx.ChannelRepository.updatePlayerStatus(
      newPlayerStatus
    );

    return playerStatus;
  });
};

module.exports.deleteChannel = async ({ channelId, userId }) => {
  return db.ChannelRepository.deleteChannel({ channelId, userId });
};

module.exports.searchUsers = async ({ username }) => {
  return db.UserRepository.searchUsers({ username });
};

module.exports.addFriendRequest = async ({ fromUser, toUser }) => {
  return db.t(async t => {
    await t.UserRepository.addFriendRequest({ fromUser, toUser });
    const user = await t.UserRepository.getUser({ userId: fromUser });
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar
    };
  });
};

module.exports.deleteFriendRequest = async ({ userId1, userId2 }) => {
  return db.UserRepository.deleteFriendRequest({ userId1, userId2 });
};

module.exports.addFriend = async ({ userId1, userId2 }) => {
  return db.tx(async tx => {
    await tx.UserRepository.addFriend({ userId1, userId2 });
    const newChannel = await tx.ChannelRepository.addFriendRoom();
    await tx.MemberRepository.addMembers({
      channelId: newChannel.id,
      userIds: [userId1, userId2]
    });
    const channelInfo = await tx.ChannelRepository.getRoom({
      channelId: newChannel.id,
      userId: userId1
    });
    return channelInfo;
  });
};

module.exports.deleteFriend = async ({ userId1, userId2 }) => {
  return db.tx(async tx => {
    await tx.UserRepository.deleteFriend({ userId1, userId2 });
    const deletedChannel = await tx.ChannelRepository.deleteFriendRoom({
      userId1,
      userId2
    });
    return deletedChannel;
  });
};

module.exports.deleteBlock = async ({ fromUser, toUser }) => {
  return db.t(async t => {
    const userRelationship = await t.UserRepository.getUserRelationship({
      userId1: fromUser,
      userId2: toUser
    });

    if (
      (userRelationship.type === "block_first_second" &&
        fromUser === userRelationship.firstUserId) ||
      (userRelationship.type === "block_second_first" &&
        fromUser === userRelationship.secondUserId)
    ) {
      await t.UserRepository.unblockStranger({
        userId1: fromUser,
        userId2: toUser
      });
    } else if (userRelationship.type === "block_both") {
      await t.ChannelRepository.unblockBlocker({
        fromUser,
        toUser
      });
    }
  });
};

module.exports.getPlayerStatus = async ({ userId, channelId }) => {
  const playerStatus = await db.ChannelRepository.getPlayerStatus({
    userId,
    channelId
  });

  return playerStatus;
};

module.exports.getAvgPostLikesInLast50Hrs = async ({ channelId }) => {
  const repeatPostIds = await db.ChannelRepository.getPostLikesInLast50Hrs({
    channelId
  });
  const avgLikes = repeatPostIds.length / [...new Set(repeatPostIds)].length;
  return avgLikes || 0;
};

module.exports.getAvgCommentInLast50Hrs = async ({ channelId }) => {
  const response = await db.ChannelRepository.getCommentIdsInLast50Hrs({
    channelId
  });
  const repeatPostIds = response.map(response.post_id);
  const avgComments = response.length / [...new Set(repeatPostIds)].length;
  return avgComments || 0;
};

module.exports.getAvgCommentInLast50Hrs = async ({ channelId }) => {
  const response = await db.ChannelRepository.getCountFollowRequestsInLast50Hrs(
    { channelId }
  );
  return response.count || 0;
};

module.exports.getCountFollowRequestsInLast50Hrs = async ({ channelId }) => {
  const response = db.ChannelRepository.getCountFollowRequestsInLast50Hrs({
    channelId
  });
  return response.count || 0;
};

module.exports.getNewChannels = async () => {
  const response = await db.ChannelRepository.getNewChannels();
  return response;
};
