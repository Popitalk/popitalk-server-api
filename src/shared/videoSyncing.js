const moment = require("moment");

module.exports.BUFFER_TIME = 3;

module.exports.defaultPlayerStatus = () => {
  return {
    queueStartPosition: 0,
    videoStartTime: 0,
    clockStartTime: moment(),
    status: "Ended"
  };
};

const checkNewPlayerStatus = (
  { queueStartPosition, clockStartTime, videoStartTime },
  playlist,
  newPlayerStatus
) => {
  if (newPlayerStatus.queueStartPosition >= playlist.length) {
    return this.defaultPlayerStatus();
  }

  if (
    playlist[newPlayerStatus.queueStartPosition].length -
      newPlayerStatus.videoStartTime <
    5
  ) {
    // The current video is very near to the end
    const nextPosition = newPlayerStatus.queueStartPosition + 1;

    if (nextPosition < playlist.length) {
      // Skip to the next video
      return this.calculateNextPlayerStatus(
        { queueStartPosition, clockStartTime, videoStartTime },
        playlist,
        nextPosition
      );
    } else {
      // Consider the stream ended
      return this.defaultPlayerStatus();
    }
  }

  return newPlayerStatus;
};

module.exports.calculateNextPlayerStatus = (
  { queueStartPosition, clockStartTime, videoStartTime },
  playlist,
  nextPosition
) => {
  const newPlayerStatus = {
    queueStartPosition: nextPosition,
    videoStartTime: 0,
    status: "Playing"
  };

  let queuePosition = queueStartPosition + 1;
  let elapsedTime =
    playlist[queueStartPosition].length - videoStartTime + this.BUFFER_TIME;
  while (queuePosition < nextPosition) {
    elapsedTime += playlist[queuePosition].length + this.BUFFER_TIME;
    queuePosition++;
  }

  newPlayerStatus.clockStartTime = moment(clockStartTime).add(
    elapsedTime,
    "seconds"
  );

  return newPlayerStatus;
};

module.exports.calculatePlayerStatus = (
  { queueStartPosition, clockStartTime, videoStartTime, status },
  playlist,
  getCurrentOnly,
  currTime = moment()
) => {
  if (playlist.length === 0 || status === "Ended") {
    return this.defaultPlayerStatus();
  }

  const momentStartTime = moment(clockStartTime);

  const newPlayerStatus = {
    queueStartPosition,
    videoStartTime: videoStartTime,
    clockStartTime: momentStartTime,
    status
  };

  if (status === "Paused") return newPlayerStatus;

  if (getCurrentOnly) { }
  else if (currTime - momentStartTime >= 0) {
    // The user has joined an active channel
    // They will begin buffering at a bufferTime seconds into the future
    currTime.add(this.BUFFER_TIME, "seconds");
    newPlayerStatus.clockStartTime = currTime;
  } else {
    return checkNewPlayerStatus(
      { queueStartPosition, clockStartTime, videoStartTime },
      playlist,
      newPlayerStatus
    );
  }

  const msToS = 1 / 1000;
  let elapsedTime = (currTime - momentStartTime) * msToS;

  newPlayerStatus.videoStartTime += elapsedTime;
  while (newPlayerStatus.queueStartPosition < playlist.length) {
    let currVideoTime = playlist[newPlayerStatus.queueStartPosition].length;
    if (newPlayerStatus.videoStartTime > currVideoTime) {
      newPlayerStatus.queueStartPosition++;

      if (newPlayerStatus.queueStartPosition === playlist.length) {
        // The stream has ended
        return this.defaultPlayerStatus();
      }

      // Subtract the video length from the elapsed time
      // Also subtract buffer time in between this video and the next
      newPlayerStatus.videoStartTime -= currVideoTime + this.BUFFER_TIME;

      if (newPlayerStatus.videoStartTime < 0) {
        // The user has joined the channel in between videos
        // Re-add the buffer time between this video and the next
        // This is the time the user will begin watching the video
        newPlayerStatus.videoStartTime += this.BUFFER_TIME;
        break;
      }
    } else {
      break;
    }
  }

  if (getCurrentOnly) {
    if (newPlayerStatus.queueStartPosition >= playlist.length) {
      return this.defaultPlayerStatus();
    }
    
    return newPlayerStatus;
  }
  
  return checkNewPlayerStatus(
    { queueStartPosition, clockStartTime, videoStartTime },
    playlist,
    newPlayerStatus
  );
};
