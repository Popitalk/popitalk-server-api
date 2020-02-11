/* eslint-disable no-param-reassign */
const http = require("http");
const WebSocket = require("ws");
const config = require("./config");
const upgradeHandler = require("./websockets/upgradeHandler");
const messageHandler = require("./websockets/messageHandler");
const closeHandler = require("./websockets/closeHandler");
const loginEvent = require("./websockets/events/loginEvent");
const { websocketsOfUsers } = require("./config/state");
const { HELLO, PING } = require("./config/constants");
const redis = require("./config/redis");

if (config.mode !== "production") {
  require("./helpers/createProjectDirectories");
}
const { app } = require("./app");
const logger = require("./config/logger");

// let server;
// if (config.mode !== "testing") {
// let heartbeat;
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

upgradeHandler(wss, server);

wss.on("connection", async (ws, request) => {
  const userId = request.session.passport.user;

  messageHandler(ws, userId);
  closeHandler(ws, userId);

  await loginEvent(ws, request);
});

const heartbeat = setInterval(() => {
  websocketsOfUsers.forEach(client => {
    try {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;

      if (client.readyState === 1) {
        client.send(
          JSON.stringify({
            type: PING
          })
        );
      }
    } catch (error) {
      logger.error(error);
    }
  });
}, config.heartbeatInterval);

server.listen(config.port || 4000, config.host || "localhost", () => {
  logger.info(
    `Server is running at ${server.address().address}:${
      server.address().port
    } in ${app.get("env")} mode`
  );
});
// }

module.exports = { server, heartbeat };

if (config.mode === "production") {
  require("./helpers/gracefulExit")(server);
}
