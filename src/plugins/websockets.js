module.exports = {
  name: "websockets",
  version: "1.0.0",
  async register(server, options) {
    server.route({
      method: "GET",
      path: "/ws",
      options: {
        auth: false,
        id: "hello123"
      },
      async handler(req, res) {
        console.log("AAAAA", req.auth);
        // await request.socket.send("abc");
        return "world!";
      }
    });

    // server.auth.scheme("basic", () => ({
    //   authenticate(req, res) {
    //     const auth = req.yar.get("auth");
    //     if (!auth) throw Boom.unauthorized();
    //     const { isAuthenticated, credentials } = auth;
    //     if (!isAuthenticated) throw Boom.unauthorized();
    //     return res.authenticated({ credentials });
    //   }
    // }));
    // server.auth.strategy("simple", "basic");
  }
};
