var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
require("dotenv").config();
var cors = require('cors');
const connectDB = require("./temp.js"); 
const { connectSQL } = require("./db-sql");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var analyzer=require('./routes/analyze');
var audioRoute=require("./routes/audio.js");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ssoRoutes = require("./routes/sso");



var app = express();

// Compress all responses (HTML, JS, CSS, images going through Express, JSON, etc.)
// Helps a lot on shared/weak WiFi with many concurrent students.
app.use(compression());

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  exposedHeaders: ["Authorization"]
}));

app.options("*", cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  exposedHeaders: ["Authorization"]
}));
// Both connections must finish before the server starts accepting requests —
// otherwise early requests can hit routes before the DB pool is ready.
const dbReady = Promise.all([
  connectDB(),
  connectSQL().catch(err => {
    console.log("⚠️ SQL init failed, server continuing anyway:", err.message);
  }),
]);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static assets (logos/images/etc in /public) — cached by the browser for 1 day
// so repeat loads (or page reloads mid-test) don't re-hit the server for the
// same files. Lower this to '1h' or '10m' while you're still actively
// swapping image files during development/testing.
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/analyze',analyzer);
app.use("/upload-audio", audioRoute);
app.use("/", sessionRoutes);

app.use("/feedback", feedbackRoutes);
app.use("/admin", adminRoutes);
app.use(ssoRoutes);

// Frontend build (React/Vite dist) — same caching treatment.
app.use(express.static(path.join(__dirname, "../ResumeAi/dist"), {
  maxAge: '1d',
  etag: true,
}));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../ResumeAi/dist", "index.html"));
});





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
  res.render('error');
});

module.exports = app;
module.exports.dbReady = dbReady;