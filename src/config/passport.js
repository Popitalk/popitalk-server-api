const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const getUser = require("../database/queries/getUser");

passport.use(
  new LocalStrategy(
    { usernameField: "usernameOrEmail", passwordField: "password" },
    async (usernameOrEmail, password, done) => {
      try {
        const user = await getUser({
          usernameOrEmail,
          withPassword: true
        });

        if (!user) return done(null, false);

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect) return done(null, false);

        user.password = undefined;

        return done(null, user);
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

    if (user) return done(null, user);
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;
