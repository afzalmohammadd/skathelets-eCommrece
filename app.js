var createError = require('http-errors');
const EventEmitter = require('events')

var express = require('express');
var path = require('path');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var nocache = require('nocache')
var logger = require('morgan');
const expressLayouts = require('express-ejs-layouts')
const connectDB=require("./connections/database")
const bodyParser = require('body-parser')

const flash = require('connect-flash');
const Razorpay = require('razorpay')

// const BlockOr = require('./middlewares/blockCheck')



var userRouter = require('./routes/userRouter');
var adminRouter = require('./routes/adminRouter');

var app = express();
connectDB();
// app.use(BlockOr())
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.set('layout', 'layouts/userLayout') // set default layout for user pages
app.set('layout', 'layouts/adminLayout')
app.use(expressLayouts) //middleware that helps to create reusable layouts for your views

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(nocache())

app.use(flash())

app.use(session({
  secret:"blackpark",
  
  saveUninitialized: true,
  resave:false,
  cookie:{
      maxAge:6000000
  }
}))

app.use(express.static(path.join(__dirname, 'public')))



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', userRouter);
app.use('/admin', adminRouter);







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

const bus = new EventEmitter();
// Add listeners to the "Bus" event...
// ...

// Set the maximum number of listeners for the "Bus" event to 20
bus.setMaxListeners(20);


module.exports = app;
