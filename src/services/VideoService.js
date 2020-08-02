const Boom = require("@hapi/boom");
const db = require("../config/database");

module.exports.addVideo = async ({
  userId,
  channelId,
  source,
  sourceId,
  length,
  videoInfo
}) => {
  return db.tx(async tx => {
    await tx.VideoRepository.getHasPermission({ userId, channelId });
    const videoId = `${source} ${sourceId}`;
    const video = await tx.VideoRepository.addVideo({
      videoId,
      channelId,
      length,
      videoInfo
    });
    const channelVideo = await tx.VideoRepository.addChannelVideo({
      channelId,
      videoId
    });

    const { videoInfo: dbVideoInfo, ...minVideo } = video;

    return {
      ...channelVideo,
      ...dbVideoInfo,
      ...minVideo
    };
  });
};

module.exports.deleteVideo = async ({ userId, channelId, channelVideoId }) => {
  return db.tx(async tx => {
    await tx.VideoRepository.getHasPermission({ userId, channelId });
    const deletedChannelVideo = await tx.VideoRepository.deleteChannelVideo({
      channelVideoId
    });
    await tx.VideoRepository.updateQueuePositionsAfterDelete({
      ...deletedChannelVideo
    });
    return deletedChannelVideo;
  });
};

module.exports.updateQueue = async ({ userId, channelId, videoIds }) => {
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