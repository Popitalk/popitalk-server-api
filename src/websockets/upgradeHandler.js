const sessionParser = require("../config/sessionParser");

const upgradeHandler = (wss, server) => {
  server.on("upgrade", (request, socket, head) => {
    sessionParser(request, {}, () => {
      if (
        !(
          request.session &&
          request.session.passport &&
          request.session.passport.user
        )
      ) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit("connection", ws, request);
      });
    });
  });
};

module.exports = upgradeHandler;
