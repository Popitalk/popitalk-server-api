const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const getUser = require("../database/queries/getUser");
const getUsersAndRelationships = require("../database/queries/getUsersAndRelationships");
const formatUsersAndRelationships = require("../helpers/formatUsersAndRelationships");

passport.use(
  new LocalStrategy(
    { usernameField: "usernameOrEmail", passwordField: "password" },
    async (usernameOrEmail, password, done) => {
      try {
        let response;

        const user = await getUser({
          usernameOrEmail,
          withPassword: true
        });

        if (!user) return done(null, false);

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect) return done(null, false);

        user.password = undefined;

        const usersAndRelationships = await getUsersAndRelationships({
          userId: user.id
        });

        if (usersAndRelationships) {
          const formattedUsersAndRelationships = formatUsersAndRelationships(
            user.id,
            usersAndRelationships
          );
          response = {
            ...user,
            relationships: formattedUsersAndRelationships.relationships,
            users: formattedUsersAndRelationships.users
          };
        } else {
          response = user;
        }

        return done(null, response);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUser({ userId: id });

    if (user) {
      let response;

      const usersAndRelationships = await getUsersAndRelationships({
        userId: user.id
      });

      if (usersAndRelationships) {
        const formattedUsersAndRelationships = formatUsersAndRelationships(
          user.id,
          usersAndRelationships
        );
        response = {
          ...user,
          relationships: formattedUsersAndRelationships.relationships,
          users: formattedUsersAndRelationships.users
        };
      } else {
        response = user;
      }

      return done(null, response);
    }
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
