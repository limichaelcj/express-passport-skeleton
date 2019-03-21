// environment variables
require('dotenv').config();

// main dependencies
const express = require('express');
const mongoose = require('mongoose');

// auth-session dependencies
const session = require('express-session');
const passport = require('passport');
const authSetup = require('./server/auth');

// dev dependencies
const path = require('path'); // auto from node-express
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// local dependencies
const serverNotice = require('./server/middlewares/serverNotice');
const indexRouter = require('./server/routes/index');

// new express app
const app = express();

// apply middlewares
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(process.cwd() + '/public'));
// auth-session
app.use(session({
  secret: process.env.SESSION_SECRET, // req. secret phrase
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// send notices to user via uri query
app.use(serverNotice);
// debug logging middleware
// app.use((req,res,next)=>{
//   console.log(req.params);
//   console.log(req.query);
//   next();
// });

// main routes
app.use('/', indexRouter);

// // basic 404 handler
// app.use((req,res,next)=>{
//   res.status(404).type('text').send('Not Found');
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    error: {
      status: err.status,
      message: err.message
    }
  });
});

// database connection -- only allow requests when connection success
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', startServer);

async function startServer(){
  console.log('MongoDB connection successful');

  await authSetup();
  // async/await for all setup to complete before listening
  var server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${server.address().port}`);
  })
};
