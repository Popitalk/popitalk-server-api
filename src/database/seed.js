/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const bcrypt = require("bcryptjs");
const faker = require("faker");
const allSettled = require("promise.allsettled");
const { format } = require("date-fns");
const database = require("../config/database");
const logger = require("../config/logger");

async function seedDb() {
  logger.debug("Seeding database...");

  const client = await database.connect();

  const password = await bcrypt.hash("password", 10);

  try {
    const usersSeed = Array.from({ length: 100000 }).map(() => ({
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

    logger.debug("Generated users seed.");

    await allSettled(
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

    logger.debug("Seeded database.");
  } catch (error) {
    logger.error(error);
  } finally {
    await client.release();
    await database.end();
  }
}

seedDb();
