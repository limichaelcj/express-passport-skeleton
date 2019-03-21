const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = async function(app, db){
  // login-auth
  await passport.use(new LocalStrategy(
    function(username, password, done){
      User.findOne({username: username}, (err, user)=>{
        console.log(`User ${username} attempted to log in.`);
        if (err) return done(err);
        if (!user) return done(null, false);
        // if (password != user.password) return done(null, false);
        // check password
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  ));
  await passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  await passport.deserializeUser((id, done) => {
    console.log("deserialize id: " + id);
    User.findById(id, (err, doc) => {
      done(null, doc);
    });
  });
}
