/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const faker = require("faker");
const allSettled = require("promise.allsettled");
const { format } = require("date-fns");
const { sampleSize } = require("lodash");
const UserService = require("../src/services/UserService");
const ChannelService = require("../src/services/ChannelService");

// const addChannel = require("./queries/addChannel");
// const addMembers = require("./queries/addMembers");

async function seedDb() {
  console.log("Seeding database...");

  const password = "password";

  try {
    const usersSeed = Array.from({ length: 50 }).map(() => ({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password,
      email: faker.internet.email(),
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar()
    }));

    let seededUsers = await allSettled(
      usersSeed.map(user => UserService.addUser(user))
    );

    seededUsers = seededUsers
      .filter(su => su.status === "fulfilled")
      .map(su => su.value);

    console.log("Seeded users");

    const andrewInfo = {
      firstName: "Andrew",
      lastName: "Jang",
      username: "andrewdhjang",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "andrewdhjang@gmail.com",
      password
    };

    const neserInfo = {
      firstName: "nes",
      lastName: "ter",
      username: "nest3r",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "nest9876@gmail.com",
      password
    };

    const sunWalkerInfo = {
      firstName: "Sun",
      lastName: "Walker",
      username: "Sun Walker",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "sunwalker123@gmail.com",
      password
    };

    const silentFuzzleInfo = {
      firstName: "silent",
      lastName: "fuzzle",
      username: "silentfuzzle",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "silentfuzzle123@gmail.com",
      password
    };

    let seededDevs = await allSettled(
      [andrewInfo, neserInfo, sunWalkerInfo, silentFuzzleInfo].map(user =>
        UserService.addUser(user)
      )
    );

    seededDevs = seededDevs
      .filter(su => su.status === "fulfilled")
      .map(su => su.value);

    const devIds = seededDevs.map(su => su.id);
    const andrewId = seededDevs.filter(su => su.username === "andrewdhjang")[0]
      .id;
    const nesterId = seededDevs.filter(su => su.username === "nest3r")[0].id;
    const sunWalkerId = seededDevs.filter(su => su.username === "Sun Walker")[0]
      .id;
    const silentFuzzleId = seededDevs.filter(
      su => su.username === "silentfuzzle"
    )[0].id;

    const andrewFriendsIds = [
      ...sampleSize(seededUsers, 8).map(u => u.id),
      ...devIds.filter(id => id !== andrewId)
    ];
    const nesterFriendsIds = [
      ...sampleSize(seededUsers, 8).map(u => u.id),
      ...devIds.filter(id => id !== nesterId)
    ];
    const sunWalkerFriendsIds = [
      ...sampleSize(seededUsers, 8).map(u => u.id),
      ...devIds.filter(id => id !== sunWalkerId)
    ];
    const silentFuzzleFriendsIds = [
      ...sampleSize(seededUsers, 8).map(u => u.id),
      ...devIds.filter(id => id !== silentFuzzleId)
    ];

    for await (const fid of andrewFriendsIds) {
      try {
        await UserService.addFriendRequest({ fromUser: andrewId, toUser: fid });
        await UserService.addFriend({
          userId1: fid,
          userId2: andrewId
        });
      } catch (error) {}
    }

    for await (const fid of nesterFriendsIds) {
      try {
        await UserService.addFriendRequest({ fromUser: nesterId, toUser: fid });
        await UserService.addFriend({
          userId1: fid,
          userId2: nesterId
        });
      } catch (error) {}
    }

    for await (const fid of sunWalkerFriendsIds) {
      try {
        await UserService.addFriendRequest({
          fromUser: sunWalkerId,
          toUser: fid
        });
        await UserService.addFriend({
          userId1: fid,
          userId2: sunWalkerId
        });
      } catch (error) {}
    }

    for await (const fid of silentFuzzleFriendsIds) {
      try {
        await UserService.addFriendRequest({
          fromUser: silentFuzzleId,
          toUser: fid
        });
        await UserService.addFriend({
          userId1: fid,
          userId2: silentFuzzleId
        });
      } catch (error) {}
    }

    console.log("Seeded friends");

    await ChannelService.addRoom({
      userId: andrewId,
      userIds: [nesterId, sunWalkerId, silentFuzzleId]
    });

    console.log("Seeded groups");

    console.log("Seeded database.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

seedDb();
