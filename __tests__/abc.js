const request = require("supertest");
const { server, heartbeat } = require("../src/index");

// const apiUrlPrefix = "http://localhost:4000/api/";
describe("example", () => {
  it("should something", async () => {
    const serv = await request(server);
    const user1RegistrationInfo = {
      firstName: "some",
      lastName: "user",
      username: "someUser123",
      dateOfBirth: "2000-01-01",
      email: "someUser123@gmail.com",
      password: "someUser123"
    };

    const x = await serv.post(`/api/users/`).send(user1RegistrationInfo);

    const user1LoginInfo = {
      usernameOrEmail: x.body.email,
      password: user1RegistrationInfo.password
    };

    console.log("===");
    // console.log(x);
    console.log("===");
    console.log("XXXstatus", x.status);
    // console.log("SESSX", x.res.headers["set-cookie"]);
    // console.log("XXX", x.body);

    const d = await serv.post(`/api/sessions/login`).send(user1LoginInfo);

    // const user1Cookie = d.res.headers["set-cookie"][0].split(";")[0].slice(8);
    const user1Cookie = d.res.headers["set-cookie"];
    // const user1Cookie = d.res.headers["set-cookie"][0].split(";")[0].slice(8);
    // console.log("status", d);
    console.log("DDDstatus", d.status);
    // console.log("user1Cookie", user1Cookie);
    // console.log("ddd", d.body);

    const y = await serv
      .get(`/api/sessions/validate`)
      .set("Cookie", user1Cookie);

    console.log("YYYstatus", y.status);
    console.log("yyy", y.body);

    clearInterval(heartbeat);
    expect(1 + 1).toBe(2);
  });
});
