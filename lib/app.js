"use strict";

var express = require('express');

var http = require('http');

var path = require('path');

var app = express();
http.createServer(app);
app.use('/static', express.static('./src/client'));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/test.html'));
});
app.get('/nakama-js.umd.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/../node_modules/@heroiclabs/nakama-js/dist/nakama-js.umd.js'));
});
app.get('/device-uuid.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/../node_modules/device-uuid/lib/device-uuid.js'));
});
app.get('/phaser.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/../node_modules/phaser/dist/phaser.js'));
});
app.listen(3300);