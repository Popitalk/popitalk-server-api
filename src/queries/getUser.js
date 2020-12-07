const knex = require("../config/knex");

module.exports = ({
  userId,
  username,
  email,
  usernameOrEmail,
  withPassword
}) => {
  const query = knex
    .select("users.id")
    .select("first_name AS firstName")
    .select("last_name AS lastName")
    .select("username")
    .select("date_of_birth AS dateOfBirth")
    .select("avatar")
    .select("email")
    .select("email_verified AS emailVerified")
    .select("users.created_at AS createdAt")
    .select(
      knex.raw(
        `COUNT(CASE user_relationships.type WHEN 'friend_both' THEN 1 ELSE NULL END) AS friends_count`
      )
    )
    .select(
      knex.raw(
        `COUNT(CASE WHEN members.banned = false AND channels.public = true AND channels.owner_id != users.id THEN 1 ELSE NULL END) AS following_count`
      )
    )
    .from("users")
    .leftJoin(
      "user_relationships",
      "users.id",
      "user_relationships.first_user_id"
    )
    .leftJoin("members", "users.id", "members.user_id")
    .leftJoin("channels", "channels.id", "members.channel_id")
    .whereNull("deleted_at")
    .groupBy("users.id");

  if (usernameOrEmail) {
    query.andWhereRaw(
      /* SQL */ `
      (username = ? OR email = ?)
      `,
      [usernameOrEmail, usernameOrEmail]
    );
  } else if (userId) {
    query.andWhere("users.id", userId);
  } else if (username) {
    query.andWhere("username", username);
  } else if (email) {
    query.andWhere("email", email);
  }

  if (withPassword) {
    query.select("password");
  }

  return query.toString();
};
