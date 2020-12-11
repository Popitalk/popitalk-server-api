const knex = require("../config/knex");

module.exports = ({
  userId,
  username,
  email,
  usernameOrEmail,
  withPassword
}) => {
  const friendsCountQuery = knex
    .select(
      knex.raw("COUNT(DISTINCT user_relationships.created_at) AS friends_count")
    )
    .from("user_relationships")
    .where("user_relationships.type", "friend_both")
    .andWhere(function() {
      this.whereRaw("?? = ??", [
        "users.id",
        "user_relationships.first_user_id"
      ]).orWhereRaw("?? = ??", [
        "users.id",
        "user_relationships.second_user_id"
      ]);
    });

  const followingCountQuery = knex
    .select(knex.raw("COUNT(DISTINCT members.channel_id) AS following_count"))
    .from("members")
    .innerJoin("channels", "channels.id", "members.channel_id")
    .whereRaw("?? = ??", ["members.user_id", "users.id"])
    .andWhereRaw("?? != ??", ["channels.owner_id", "users.id"])
    .andWhere("members.banned", false)
    .andWhere("channels.public", true);

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
    .select(knex.raw(`(${followingCountQuery.toString()})`)) // sub-query
    .select(knex.raw(`(${friendsCountQuery.toString()})`)) // sub-query
    .from("users")
    .whereNull("deleted_at");

  if (usernameOrEmail) {
    query.andWhereRaw(
      /* SQL */ `
      (username = ? OR email = ?)
      `,
      [usernameOrEmail, usernameOrEmail]
    );
  } else if (userId) {
    query.andWhere("id", userId);
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
