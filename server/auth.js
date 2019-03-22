const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
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
        // if no password, user account is linked to social
        if (user.provider) return done(null, false);
        // if (password != user.password) return done(null, false);
        // check password
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        user.update(
          { $set: { last_login: new Date() },
            $inc: { login_count: 1 } },
          (err, doc) => {
            if (err) return done(err);
            return done(null, user);
          }
        );
      });
    }
  ));
  await passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/oauth/github/callback'
    },
    function(accessToken, refreshToken, profile, cb) {

      User.findOneAndUpdate(
        //search query
        { social_id: profile.id },
        //update
        {
          $setOnInsert: {
            social_id: profile.id,
            username: profile.username,
            name: profile.displayName || 'No display name',
            photo: profile.photos[0].value || '',
            email: profile._json.email || 'No public email',
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        //options
        {
          new: true,
          upsert: true
        },
        //callback
        (err, doc) => {
          return cb(null, doc);
        }
      );
    })
  );
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
