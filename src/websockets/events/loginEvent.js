/* eslint-disable no-param-reassign */
const { heartbeatInterval } = require("../../config");
const {
  websocketsOfUsers,
  channelsState,
  usersState
} = require("../../config/state");
const { HELLO, WS_FRIEND_ONLINE } = require("../../config/constants");
const { subscriber, publisher } = require("../../config/pubSub");

const loginEvent = async (ws, request) => {
  const userId = request.session.passport.user;

  subscriber.subscribe(userId);
  websocketsOfUsers.set(userId, ws);

  const allChannels = request.session.user.channels;

  if (allChannels) {
    usersState.set(userId, new Map());

    Object.entries(allChannels).forEach(([channelId, channel]) => {
      usersState.get(userId).set(channelId, channel.type);
      if (channel.type === "friend") {
        publisher({
          type: WS_FRIEND_ONLINE,
          channelId,
          initiator: userId,
          payload: {
            channelId
          }
        });
      }
    });

    for await (const cid of usersState.get(userId).keys()) {
      if (!channelsState.has(cid)) {
        channelsState.set(cid, new Set());
        subscriber.subscribe(cid);
      }

      channelsState.get(cid).add(userId);
    }
  }

  ws.isAlive = true;
  ws.send(
    JSON.stringify({
      type: HELLO,
      payload: {
        heartbeatInterval: Number(heartbeatInterval)
      }
    })
  );
};

module.exports = loginEvent;
