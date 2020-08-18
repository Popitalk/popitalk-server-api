const moment = require("moment");
const db = require("../config/database");
const { calculatePlayerStatus } = require("../shared/videoSyncing");

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

    const storedPlayerStatus = await tx.ChannelRepository.getPlayerStatus({ 
      channelId 
    });
    const queue = await this.getQueue({ channelId });
    const currTime = moment();
    let playerStatus = calculatePlayerStatus(
      storedPlayerStatus, queue, true, currTime);

    if (deletedChannelVideo.queuePosition < storedPlayerStatus.queueStartPosition) {
      playerStatus = await tx.ChannelRepository.updatePlayerStatus({
        channelId,
        queueStartPosition: playerStatus.queueStartPosition,
        videoStartTime: playerStatus.videoStartTime,
        clockStartTime: currTime.format(),
        status: playerStatus.status
      });
    } else {
      playerStatus = null;
    }

    return { deletedChannelVideo, playerStatus };
  });
};

module.exports.getQueue = async ({ channelId }) => {
  const queue = await db.VideoRepository.getChannelQueue({ channelId });
  const transformedQueue = queue.map(v => {
    const { videoInfo, ...minVideo } = v;

    return {
      ...videoInfo,
      ...minVideo
    };
  });

  return transformedQueue;
}

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
    } else {
      await tx.VideoRepository.updateQueuePositionsAfterLowToHighSwap({ 
        channelId, 
        channelVideoId: channelVideo.id, 
        oldIndex, 
        newIndex
      });
    }
    
    const storedPlayerStatus = await tx.ChannelRepository.getPlayerStatus({ 
      channelId 
    });
    const queue = await this.getQueue({ channelId });
    const currTime = moment();
    let playerStatus = calculatePlayerStatus(
      storedPlayerStatus, queue, true, currTime);

    const queueStartPosition = playerStatus.queueStartPosition;
    let newQueueStartPosition = -1;

    if (playerStatus.status === "Ended") {
      newQueueStartPosition = 0;
    } else if (oldIndex === queueStartPosition) {
      newQueueStartPosition = newIndex;
    } else if (newIndex <= queueStartPosition && oldIndex > queueStartPosition) {
      newQueueStartPosition = queueStartPosition + 1;
    } else if (oldIndex < queueStartPosition && newIndex >= queueStartPosition) {
      newQueueStartPosition = queueStartPosition - 1;
    }

    if (newQueueStartPosition !== -1) {
      playerStatus = await tx.ChannelRepository.updatePlayerStatus({
        channelId,
        queueStartPosition: newQueueStartPosition,
        videoStartTime: playerStatus.videoStartTime,
        clockStartTime: currTime.format(),
        status: playerStatus.status
      });
    } else {
      playerStatus = null;
    }

    return playerStatus;
  });
};
