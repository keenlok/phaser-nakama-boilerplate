"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nakamajs = require('@heroiclabs/nakama-js');

var verboseLogging = true;
var useSSL = false;
var client = new nakamajs.Client('defaultkey');
client.verbose = verboseLogging;
client.ssl = useSSL;
var currentSession = null;
var matchId = null;
var canPlay = false;

function authenticateAndHandleSession(_x) {
  return _authenticateAndHandleSession.apply(this, arguments);
}

function _authenticateAndHandleSession() {
  _authenticateAndHandleSession = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(client) {
    var email, password, randomUserId;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            email = "keenloklai@gmail.com";
            password = "3bc8f72e95a9";
            randomUserId = new DeviceUUID().get();
            client.authenticateDevice({
              id: randomUserId,
              create: true,
              username: "mycustomusername"
            }).then(function (session) {
              console.info("Successfully authenticated:", session); // sessionHandler(session);

              gameSessionHandler(session);
            }).catch(function (error) {
              console.log("error : ", error);
            });

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _authenticateAndHandleSession.apply(this, arguments);
}

function sessionHandler(session) {
  if (session) {
    console.info("Session expired?", session.isexpired(Date.now() / 1000));
  }

  var socket = client.createSocket(useSSL, verboseLogging);
  socket.connect(session).then(function (session) {
    socket.onchannelmessage = function (channelMessage) {
      console.info("Received chat message:", channelMessage);
    };

    var channelId = "pineapple-pizza-lovers-room";
    socket.send({
      channel_join: {
        type: 1,
        // 1 = room, 2 = Direct Message, 3 = Group
        target: channelId,
        persistence: false,
        hidden: false
      }
    }).then(function (response) {
      console.info("Successfully joined channel:", response.channel.id);
      socket.send({
        channel_message_send: {
          channel_id: response.channel.id,
          content: {
            "message": "Pineapple doesn't belong on a pizza!"
          }
        }
      }).then(function (messageAck) {
        console.info("Successfully sent chat message:", messageAck);
      }).catch(function (e) {
        console.log("error: ", e);
      });
    });
  });
}

function gameSessionHandler(session) {
  var socket = client.createSocket(useSSL, verboseLogging);
  socket.connect(session).then(function (session) {
    // var id = "<matchid>";
    // console.log(id)
    // socket.send({ match_create: {} })
    // .then(response => {
    //   console.log("Created match with ID:", response.match.match_id)
    // })
    var message = {
      matchmaker_add: {
        min_count: 2,
        max_count: 4,
        query: "*",
        string_properties: {
          region: "europe"
        },
        numeric_properties: {
          rank: 8
        }
      }
    };
    var ticket;
    socket.send(message).then(function (ticket) {
      console.log("Ticket received", ticket);
      ticket = ticket;
    });

    socket.onmatchmakermatched = function (matched) {
      console.info("Received MatchmakerMatched message: ", matched);
      console.info("Matched opponents: ", matched.users);
      var message = {
        match_join: {
          token: matched.token
        }
      };
      socket.send(message).then(function (response) {
        console.log("Match join", response);
        matchId = response.match.match_id;
      });
    };
  });
}

authenticateAndHandleSession(client);