const express = require('express');
const passport = require('passport');
const User = require('../../models/User');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// custom middleware
function ensureAuthenticated(req,res,next){
  if (req.isAuthenticated()) return next();
  console.log('Not logged in. Redirect to index.');
  res.redirect('/?notice=requireLogin');
}

const router = express.Router();

// server routes
router.get('/', (req,res) => {
  res.render('index', {
    user: req.user ? req.user.username : null,
    route: '/',
    notice: res.notice
  });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/?notice=loginFail',
  successRedirect: '/profile'
}));

// register middlewares:
// 1- check existing user, create user
// 2--- passport auth
// 3----- redirect to profile on success
router.post('/register', /*1*/ (req,res,next) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    var notice = err ? "registrationFail" : "registrationSuccess"
    if (err) next(err);
    else if (user) res.redirect('/?notice=' + notice);
    else {
      bcrypt.hash(req.body.password, saltRounds, (err,hash)=>{
        if(err) next(err);
        User.create({
          username: req.body.username,
          password: hash
        }, (err, doc) => {
          var notice = err ? "registrationFail" : "registrationSuccess";
          if (err) res.redirect('/?notice=' + notice);
          next(null, user);
        });
      });
    }
  });
}, /*2*/ passport.authenticate('local', { // middleware 2
  failureRedirect: '/'
}), /*3*/ (req,res,next) => { // middleware 3
  res.redirect('/profile');
});

router.get('/logout', (req,res)=>{
  req.logout();
  res.redirect('/?notice=logout')
});

router.get('/profile', ensureAuthenticated, (req,res)=>{
  res.render('profile', {
    route: '/profile',
    user: req.user.username
  });
});


module.exports = router;
