"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Phaser = require('phaser');

var nakamajs = require('@heroiclabs/nakama-js');

var verboseLogging = true;
var useSSL = false;
var currentSession = null;
var matchId = null;
var canPlay = false;

var Game =
/*#__PURE__*/
function (_Phaser$scene) {
  _inherits(Game, _Phaser$scene);

  function Game() {
    var _this;

    _classCallCheck(this, Game);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Game).call(this, 'main'));
    _this.avatar = {};
    return _this;
  }

  _createClass(Game, [{
    key: "preload",
    value: function preload() {
      this.load.image('avatar', './static/avatar.png');
    }
  }, {
    key: "create",
    value: function create() {
      var client = new nakamajs.Client('defaultkey');
      client.verbose = verboseLogging;
      client.ssl = useSSL;
      this.authenticateAndHandleSession(client);
    }
  }, {
    key: "authenticateAndHandleSession",
    value: function () {
      var _authenticateAndHandleSession = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(client) {
        var _this2 = this;

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

                  _this2.gameSessionHandler(session);
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

      function authenticateAndHandleSession(_x) {
        return _authenticateAndHandleSession.apply(this, arguments);
      }

      return authenticateAndHandleSession;
    }()
  }, {
    key: "sessionHandler",
    value: function sessionHandler(session) {
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
  }, {
    key: "gameSessionHandler",
    value: function gameSessionHandler(session) {
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
  }]);

  return Game;
}(Phaser.scene);