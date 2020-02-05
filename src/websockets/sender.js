const _ = require("lodash");
const {
  websocketsOfUsers,
  usersOfChannels,
  channelsOfUsers
} = require("../config/state");
const {
  userEvents,
  channelEvents,
  channelsEvents
} = require("../config/constants");

const sender = async (messageType, messagePayload) => {
  if (userEvents.includes(messageType)) {
    const { userId } = messagePayload;

    const ws = websocketsOfUsers.get(userId);

    ws.send(
      JSON.stringify({
        type: messageType,
        payload: messagePayload
      })
    );
  } else if (channelEvents.includes(messageType)) {
    const { channelId } = messagePayload;

    if (usersOfChannels.has(channelId)) {
      const userIds = usersOfChannels.get(channelId).values();

      for await (const uid of userIds) {
        const ws = websocketsOfUsers.get(uid);

        // if(ws.readyState === 1)
        ws.send(
          JSON.stringify({
            type: messageType,
            payload: messagePayload
          })
        );
      }
    }
  } else if (channelsEvents.includes(messageType)) {
    const { userId } = messagePayload;

    if (channelsOfUsers.has(userId)) {
      const channelIds = channelsOfUsers.get(userId).keys();

      for await (const cid of channelIds) {
        if (usersOfChannels.has(cid)) {
          const userIds = usersOfChannels.get(cid).values();

          for await (const uid of userIds) {
            const ws = websocketsOfUsers.get(uid);

            ws.send(
              JSON.stringify({
                type: messageType,
                payload: messagePayload
              })
            );
          }
        }
      }
    }
  }
};

module.exports = sender;
