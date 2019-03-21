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

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/'
}), (req,res)=>{
  console.log('github oauth success');
  res.redirect('/profile');
});
router.get('/github')

module.exports = router;
