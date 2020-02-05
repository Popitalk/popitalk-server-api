/* eslint-disable no-param-reassign */
const { PONG } = require("../config/constants");
const { websocketsOfUsers } = require("../config/state");
const logoutEvent = require("../websockets/events/logoutEvent");

const closeHandler = (ws, userId) => {
  ws.on("close", () => {
    websocketsOfUsers.delete(userId);
    logoutEvent(userId);
  });
};

module.exports = closeHandler;
