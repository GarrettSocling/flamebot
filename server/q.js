// Generated by CoffeeScript 1.8.0
var app, bodyParser, clients, express, messages, session;

express = require('express');

session = require('express-session');

bodyParser = require('body-parser');

app = express();

app.disable('etag');

app.use(bodyParser.json({
  extended: true
}));

app.use(session({
  secret: 'flattened',
  resave: true,
  saveUninitialized: true,
  store: new session.MemoryStore()
}));

messages = [];

clients = {};

app.get('/', function(req, res) {
  var message, sess;
  sess = req.session;
  sess.nextMessage || (sess.nextMessage = 1);
  message = messages[sess.nextMessage - 1];
  if (message) {
    sess.nextMessage += 1;
    return res.json(message);
  } else {
    return res.json({});
  }
});

app.post('/', function(req, res) {
  var id, sess, _name;
  sess = req.session;
  id = clients[_name = req.sessionID] || (clients[_name] = 1 + Object.keys(clients).length);
  req.body.sender = id;
  req.body.serial = messages.length;
  messages.push(req.body);
  return res.json({
    sent: req.body
  });
});

app.listen(7777, function() {
  return console.log('app started');
});
