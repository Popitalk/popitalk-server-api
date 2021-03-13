const Boom = require("@hapi/boom");
const fileType = require("file-type");
const moment = require("moment");
const redis = require("../config/redis");
const { uploadFile } = require("../config/aws");
const db = require("../config/database");
const addViewers = require("../helpers/addViewers");

const { BUFFER_TIME } = require("../shared/videoSyncing");
const getCurrentPlayerStatus = require("../helpers/getCurrentPlayerStatus");

module.exports.addChannel = async ({
  userId,
  name,
  description,
  public: publicChannel,
  icon,
  categories
}) => {
  return db.tx(async tx => {
    const { count } = await tx.UserRepository.getUserChannelsCount({
      userId
    });

    if (Number(count) === 0) {
      let uploadedIcon;
      let channelName = name;
      if (icon) {
        const { payload: buffer } = icon;
        const type = fileType(buffer);
        const fileName = `channelIcon-${userId}_${new Date().getTime()}`;
        const uploadedImage = await uploadFile(buffer, fileName, type);
        if (!uploadedImage) throw Boom.internal("Couldn't upload icon");
        uploadedIcon = uploadedImage.Location;
      }

      if (!channelName) {
        const { username } = await tx.UserRepository.getUser({ userId });
        channelName = `${username} channel`;
      }

      const newChannel = await tx.ChannelRepository.addChannel({
        ownerId: userId,
        name: channelName,
        description,
        public: publicChannel,
        icon: uploadedIcon
      });

      await tx.MemberRepository.addMember({
        channelId: newChannel.id,
        userId,
        admin: true
      });

      if (categories.length > 0) {
        await tx.CategoryRepository.addChannelCategories({
          channelId: newChannel.id,
          categories
        });
      }

      const channelInfo = await tx.ChannelRepository.getAdminChannel({
        channelId: newChannel.id,
        userId
      });

      channelInfo.channel.categories = categories;

      return channelInfo;
    }
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

module.exports.getChannel = async ({ channelId, userId, isViewer }) => {
  return db.task(async t => {
    let channelInfo;
    const chMemInfo = await t.ChannelRepository.getChannelAndMemberInfo({
      channelId,
      userId
    });

    if (!chMemInfo) throw Boom.notFound("Channel doesn't exist");
    if (isViewer && !chMemInfo.isPublic) throw Boom.unauthorized();

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
      channelInfo = await t.ChannelRepository.getPrivateChannel({
        channelId
      });
    }

    const categories = await t.CategoryRepository.getChannelCategories({
      channelId
    });

    const channelWithViewers = await addViewers(t, channelInfo);

    channelWithViewers.channel.categories = categories.map(({ name }) => name);

    return { ...channelWithViewers, ...chMemInfo };
  });
};

module.exports.updateChannel = async ({
  channelId,
  userId,
  name,
  description,
  public: publicChannel,
  icon,
  removeIcon,
  categories
}) => {
  return db.tx(async tx => {
    let uploadedIcon;

    if (icon) {
      const { payload: buffer } = icon;
      const type = fileType(buffer);
      const fileName = `icon-${userId}_${new Date().getTime()}`;
      const uploadedImage = await uploadFile(buffer, fileName, type);
      if (!uploadedImage) throw Boom.internal("Couldn't upload avatar");
      uploadedIcon = uploadedImage.Location;
    }
    const updatedChannel = await tx.ChannelRepository.updateChannel({
      channelId,
      userId,
      name,
      description,
      public: publicChannel,
      icon: uploadedIcon,
      removeIcon,
      categories
    });

    let parsedCategories;

    if (typeof categories !== "undefined") {
      parsedCategories = categories ? categories.split(",") : [];
    }

    if (parsedCategories) {
      await tx.CategoryRepository.removeChannelCategories({ channelId });
      if (categories.length > 0) {
        await tx.CategoryRepository.addChannelCategories({
          channelId,
          categories: parsedCategories
        });
      }

      updatedChannel.categories = parsedCategories;
    }

    return updatedChannel;
  });
};

module.exports.updatePlayerStatus = async newPlayerStatus => {
  return db.tx(async tx => {
    await tx.VideoRepository.getHasPermission({
      userId: newPlayerStatus.userId,
      channelId: newPlayerStatus.channelId
    });

    let playerStatus = await getCurrentPlayerStatus({
      db: tx,
      channelId: newPlayerStatus.channelId
    });

    if (!newPlayerStatus.status) {
      newPlayerStatus.status = playerStatus.status;
    }

    if (
      playerStatus.status !== "Playing" &&
      newPlayerStatus.status === "Playing"
    ) {
      newPlayerStatus.clockStartTime = moment(newPlayerStatus.clockStartTime)
        .add(BUFFER_TIME, "seconds")
        .format();
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

module.exports.searchChannels = async ({ channelName, page, userId }) => {
  return db.task(async t => {
    const { channels } = await t.ChannelRepository.searchChannels({
      channelName,
      page,
      userId
    });

    let response = {
      channels
    };

    const channelIds = Object.keys(response.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      response = {
        ...response,
        channels: {
          ...response.channels,
          [cid]: {
            ...response.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    response = {
      channelName,
      page,
      channels: response.channels,
      users: {
        ...response.users,
        ...users
      }
    };

    return response;
  });
};

module.exports.discoverChannels = async ({ userId, page }) => {
  return db.task(async t => {
    const discoverChannels = (
      await t.ChannelRepository.getDiscoverChannels({ page })
    ).channelIds;

    const { channels } = await t.VideoRepository.getVideosInfo({
      channelIds: discoverChannels,
      userId
    });

    let response = {
      channels
    };

    const channelIds = Object.keys(response.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      response = {
        ...response,
        channels: {
          ...response.channels,
          [cid]: {
            ...response.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    response = {
      page,
      channels: response.channels,
      users: {
        ...response.users,
        ...users
      }
    };

    return response;
  });
};

module.exports.recommendedChannels = async ({ userId, categories }) => {
  return db.task(async t => {
    const recommendedChannels = (
      await t.ChannelRepository.getRecommendedChannels({ categories })
    ).channelIds;

    const { channels } = await t.VideoRepository.getVideosInfo({
      channelIds: recommendedChannels,
      userId
    });

    let response = {
      channels
    };

    const channelIds = Object.keys(response.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      response = {
        ...response,
        channels: {
          ...response.channels,
          [cid]: {
            ...response.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    response = {
      channels: response.channels,
      users: {
        ...response.users,
        ...users
      }
    };

    return response;
  });
};

module.exports.trendingChannels = async ({ userId, page }) => {
  return db.task(async t => {
    const { channels } = await t.ChannelRepository.getTrendingChannels({
      userId,
      page
    });

    let response = {
      channels
    };

    const channelIds = Object.keys(response.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      response = {
        ...response,
        channels: {
          ...response.channels,
          [cid]: {
            ...response.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    response = {
      page,
      channels: response.channels,
      users: {
        ...response.users,
        ...users
      }
    };

    return response;
  });
};

module.exports.followingChannels = async ({ userId, page }) => {
  return db.task(async t => {
    const { channels } = await t.ChannelRepository.getFollowingChannels({
      userId,
      page
    });

    let response = {
      channels
    };

    const channelIds = Object.keys(response.channels);
    const allViewersIds = new Set();

    for await (const cid of channelIds) {
      const viewers = await redis.smembers(`viewers:${cid}`);
      viewers.forEach(allViewersIds.add, allViewersIds);

      response = {
        ...response,
        channels: {
          ...response.channels,
          [cid]: {
            ...response.channels[cid],
            viewers
          }
        }
      };
    }

    const { users } = await t.UserRepository.getUsers({
      userIds: [...allViewersIds]
    });

    response = {
      page,
      channels: response.channels,
      users: {
        ...response.users,
        ...users
      }
    };

    return response;
  });
};
