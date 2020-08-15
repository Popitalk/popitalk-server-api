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

module.exports.updateQueue = async ({ 
  userId, 
  channelId, 
  oldIndex, 
  newIndex 
}) => {
  if (oldIndex === newIndex) return;
  
  return db.tx(async tx => {
    await tx.VideoRepository.getHasPermission({ userId, channelId });

    const channelVideo = await tx.VideoRepository.updateQueuePosition({ 
      channelId, 
      oldIndex, 
      newIndex 
    });

    if (oldIndex > newIndex) {
      await tx.VideoRepository.updateQueuePositionsAfterHighToLowSwap({ 
        channelId, 
        channelVideoId: channelVideo.id, 
        oldIndex, 
        newIndex
      });
    } else if (oldIndex < newIndex) {
      await tx.VideoRepository.updateQueuePositionsAfterLowToHighSwap({ 
        channelId, 
        channelVideoId: channelVideo.id, 
        oldIndex, 
        newIndex
      });
    }
  });
};
