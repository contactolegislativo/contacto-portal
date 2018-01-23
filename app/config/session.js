// Redis management
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var redis = require("redis");
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];

module.exports = function(app) {
  if(env === 'production') {  
    // Use redis for session management
    config.redis.client = redis.createClient();
    app.use(session({
      secret: config.session.secret,
      store: new redisStore(config.redis),
      saveUninitialized: false,
      resave: false
    }));
  } else {
    app.use(session({
      secret: config.session.secret,
      saveUninitialized: false,
      resave: false
    }));
  }
  
}