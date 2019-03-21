module.exports = function(req,res,next){
  switch (req.query.notice){
    case 'requireLogin':
      res.notice = 'Please log in.';
      break;
    case 'loginFail':
      res.notice = 'Login failed.'
      break;
    case 'registrationFail':
      res.notice = "New user registration failed."
      break;
    case 'registrationSuccess':
      res.notice = "New user registration success."
      break;
    case 'logout':
      res.notice = 'Logged out successfully.'
      break;
    default:
      res.notice = null;
  }
  next();
}
