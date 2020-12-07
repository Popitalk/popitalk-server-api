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
        `count(case user_relationships.type when 'friend_both' then 1 else null end) as friendsCount`
      )
    )
    .select(
      knex.raw(
        `count(case when members.banned = false and channels.public = true and channels.owner_id != users.id then 1 else null end) as followingCount`
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
