/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const bcrypt = require("bcryptjs");
const faker = require("faker");
const allSettled = require("promise.allsettled");
const { format } = require("date-fns");
const { sampleSize } = require("lodash");
const database = require("../config/database");
const logger = require("../config/logger");
const addUser = require("./queries/addUser");
const addChannel = require("./queries/addChannel");
const addMembers = require("./queries/addMembers");

async function seedDb() {
  logger.debug("Seeding database...");

  const client = await database.connect();

  const password = await bcrypt.hash("password", 10);

  try {
    const usersSeed = Array.from({ length: 10000 }).map(() => ({
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

    const abc = await allSettled(
      usersSeed.map(user =>
        client.query(
          /* SQL */ `
      INSERT INTO
      users
        (
          first_name,
          last_name,
          username,
          date_of_birth,
          password,
          avatar,
          email
        )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id
      `,
          [
            user.firstName,
            user.lastName,
            user.username,
            user.dateOfBirth,
            user.password,
            user.avatar,
            user.email
          ]
        )
      )
    );

    logger.debug("Seeded users");

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

    const nesInfo = {
      firstName: "Sul",
      lastName: "Man",
      username: "nest3r",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "nest9876@gmail.com",
      password
    };

    const bugzInfo = {
      firstName: "bugz",
      lastName: "zgub",
      username: "bugz",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "bugz123@gmail.com",
      password
    };

    const leandevInfo = {
      firstName: "lean",
      lastName: "dev",
      username: "leandev",
      dateOfBirth: format(
        faker.date.between("1950-01-01", "2000-01-01"),
        "yyyy-MM-dd"
      ),
      avatar: faker.image.avatar(),
      email: "leandev123@gmail.com",
      password
    };

    const andrewUser = await addUser(andrewInfo, client);
    const nesUser = await addUser(nesInfo, client);
    const bugzUser = await addUser(bugzInfo, client);
    const leandevUser = await addUser(leandevInfo, client);
    const andrewSelfChannel = await addChannel({ type: "self" }, client);
    const nesSelfChannel = await addChannel({ type: "self" }, client);
    const bugzSelfChannel = await addChannel({ type: "self" }, client);
    const leandevSelfChannel = await addChannel({ type: "self" }, client);

    await addMembers(
      { channelId: andrewSelfChannel.id, userIds: [andrewUser.id] },
      client
    );
    await addMembers(
      { channelId: nesSelfChannel.id, userIds: [nesUser.id] },
      client
    );
    await addMembers(
      { channelId: bugzSelfChannel.id, userIds: [bugzUser.id] },
      client
    );
    await addMembers(
      { channelId: leandevSelfChannel.id, userIds: [leandevUser.id] },
      client
    );

    logger.debug("Seeded self channels");

    const friendIds1 = sampleSize(abc, 8)
      .map(res => res.value.rows)
      .flat()
      .map(us => us.id);

    const friendIds2 = sampleSize(abc, 8)
      .map(res => res.value.rows)
      .flat()
      .map(us => us.id);

    const friendIds3 = sampleSize(abc, 8)
      .map(res => res.value.rows)
      .flat()
      .map(us => us.id);

    const friendIds4 = sampleSize(abc, 8)
      .map(res => res.value.rows)
      .flat()
      .map(us => us.id);

    await allSettled(
      sampleSize(friendIds1, 8).map(id =>
        client.query(
          /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
          [id, andrewUser.id]
        )
      )
    );

    for await (const friendId of friendIds1) {
      const channel = await addChannel({ type: "friend" }, client);
      await addMembers(
        { channelId: channel.id, userIds: [andrewUser.id, friendId] },
        client
      );
    }

    await allSettled(
      sampleSize(friendIds2, 8).map(id =>
        client.query(
          /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
          [id, nesUser.id]
        )
      )
    );

    for await (const friendId of friendIds2) {
      const channel = await addChannel({ type: "friend" }, client);
      await addMembers(
        { channelId: channel.id, userIds: [nesUser.id, friendId] },
        client
      );
    }

    await allSettled(
      sampleSize(friendIds3, 8).map(id =>
        client.query(
          /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
          [id, bugzUser.id]
        )
      )
    );

    for await (const friendId of friendIds3) {
      const channel = await addChannel({ type: "friend" }, client);
      await addMembers(
        { channelId: channel.id, userIds: [bugzUser.id, friendId] },
        client
      );
    }

    await allSettled(
      sampleSize(friendIds4, 8).map(id =>
        client.query(
          /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
          [id, leandevUser.id]
        )
      )
    );

    for await (const friendId of friendIds4) {
      const channel = await addChannel({ type: "friend" }, client);
      await addMembers(
        { channelId: channel.id, userIds: [leandevUser.id, friendId] },
        client
      );
    }

    // =====
    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [nesUser.id, andrewUser.id]
    );
    const chan1 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan1.id, userIds: [nesUser.id, andrewUser.id] },
      client
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [nesUser.id, bugzUser.id]
    );
    const chan2 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan2.id, userIds: [nesUser.id, bugzUser.id] },
      client
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [nesUser.id, leandevUser.id]
    );
    const chan6 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan6.id, userIds: [nesUser.id, leandevUser.id] },
      client
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [andrewUser.id, bugzUser.id]
    );
    const chan3 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan3.id, userIds: [andrewUser.id, bugzUser.id] },
      client
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [andrewUser.id, leandevUser.id]
    );
    const chan7 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan7.id, userIds: [andrewUser.id, leandevUser.id] },
      client
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        user_relationships (first_user_id, second_user_id, type)
      VALUES (
        least($1, $2)::UUID, greatest($1, $2)::UUID, 'friend_both'
      )
      `,
      [bugzUser.id, leandevUser.id]
    );
    const chan8 = await addChannel({ type: "friend" }, client);
    await addMembers(
      { channelId: chan8.id, userIds: [bugzUser.id, leandevUser.id] },
      client
    );

    const chan4 = await addChannel({ type: "group" }, client);
    await addMembers(
      {
        channelId: chan4.id,
        userIds: [nesUser.id, andrewUser.id, bugzUser.id, leandevUser.id]
      },
      client
    );

    logger.debug("Seeded friends");
    logger.debug("Seeded database.");
  } catch (error) {
    logger.error(error);
  } finally {
    await client.release();
    await database.end();
  }
}

seedDb();
