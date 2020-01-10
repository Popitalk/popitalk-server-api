const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const getUser = require("../database/queries/getUser");
const getUsersAndRelationships = require("../database/queries/getUsersAndRelationships");
const getChannels = require("../database/queries/getChannels");
const formatUsersAndRelationships = require("../helpers/formatUsersAndRelationships");

passport.use(
  new LocalStrategy(
    { usernameField: "usernameOrEmail", passwordField: "password" },
    async (usernameOrEmail, password, done) => {
      try {
        let response = {
          users: {}
        };

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

        response = {
          ...user,
          ...response
        };

        if (usersAndRelationships) {
          const formattedUsersAndRelationships = formatUsersAndRelationships(
            user.id,
            usersAndRelationships
          );
          response = {
            ...response,
            relationships: formattedUsersAndRelationships.relationships,
            users: formattedUsersAndRelationships.users
          };
        }

        const { roomsAndChannels } = await getChannels({ userId: user.id });

        if (roomsAndChannels) {
          Object.entries(roomsAndChannels.rooms).forEach(([roomId, room]) => {
            const usersIds = Object.keys(room.users);
            response.users = {
              ...response.users,
              ...room.users
            };
            roomsAndChannels.rooms[roomId].users = usersIds;
          });
          response = {
            ...response,
            channels: roomsAndChannels.channels || {},
            rooms: roomsAndChannels.rooms || {}
          };
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
    let response;

    const user = await getUser({ userId: id });

    if (user) {
      const usersAndRelationships = await getUsersAndRelationships({
        userId: user.id
      });

      response = {
        ...user,
        ...response
      };

      if (usersAndRelationships) {
        const formattedUsersAndRelationships = formatUsersAndRelationships(
          user.id,
          usersAndRelationships
        );
        response = {
          ...response,
          relationships: formattedUsersAndRelationships.relationships,
          users: formattedUsersAndRelationships.users
        };
      }

      const { roomsAndChannels } = await getChannels({ userId: user.id });

      if (roomsAndChannels) {
        Object.entries(roomsAndChannels.rooms).forEach(([roomId, room]) => {
          const usersIds = Object.keys(room.users);
          response.users = {
            ...response.users,
            ...room.users
          };
          roomsAndChannels.rooms[roomId].users = usersIds;
        });
        response = {
          ...response,
          channels: roomsAndChannels.channels || {},
          rooms: roomsAndChannels.rooms || {}
        };
      }

      return done(null, response);
    }
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
