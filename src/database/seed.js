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

    const andrewUser = await addUser(andrewInfo, client);
    const nesUser = await addUser(nesInfo, client);
    const andrewSelfChannel = await addChannel({ type: "self" }, client);
    const nesSelfChannel = await addChannel({ type: "self" }, client);

    await addMembers(
      { channelId: andrewSelfChannel.id, userIds: [andrewUser.id] },
      client
    );
    await addMembers(
      { channelId: nesSelfChannel.id, userIds: [nesUser.id] },
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
