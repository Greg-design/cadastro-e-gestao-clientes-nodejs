const auth = require("./auth");
const db = require("./db");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.findUser(id);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });

  passport.use(
    new localStrategy(
      {
        usernameField: "nome",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await auth.findUserByName(username);
          if (!user) return done(null, false);

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return done(null, false);

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
