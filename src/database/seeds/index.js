/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const bcrypt = require("bcryptjs");
const faker = require("faker");
const allSettled = require("promise.allsettled");
const { format } = require("date-fns");
const database = require("../../config/database");
const logger = require("../../config/logger");
const addUser = require("../queries/addUser");

async function seedDb() {
  logger.debug("Seeding database...");

  const client = await database.connect();

  const password = await bcrypt.hash("password", 10);

  try {
    await client.query("BEGIN");

    const usersSeed = Array.from({ length: 2000 }).map(() => ({
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

    await allSettled(usersSeed.map(user => addUser(user, client)));

    await client.query("COMMIT");

    logger.debug("Seeded database.");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
  } finally {
    await client.release();
    await database.end();
  }
}

seedDb();
