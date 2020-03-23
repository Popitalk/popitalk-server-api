/* eslint-disable no-param-reassign */
const { websocketsOfUsers } = require("../config/state");
const logoutEvent = require("./events/logoutEvent");

const closeHandler = (ws, userId) => {
  ws.on("close", () => {
    websocketsOfUsers.delete(userId);
    logoutEvent(userId);
  });
};

module.exports = closeHandler;
