"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var nakamajs = require('@heroiclabs/nakama-js/dist/nakama-js.umd'); // var client = new nakamajs.Client("defaultkey", "127.0.0.1", 7350);
// client.ssl = false;


var client = new nakamajs.Client("defaultkey");
var currentSession = null;

function storeSession(session) {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("nakamaToken", session.token);
    console.log("Session stored.");
  } else {// We'll assume this is a React Native project.
    // AsyncStorage.setItem('@MyApp:nakamaToken', session.token).then(function(session) {
    //   console.log("Session stored.");
    // }).catch(function(error) {
    //   console.log("An error occured while storing session: %o", error);
    // })
  }
}

function getSessionFromStorage() {
  return _getSessionFromStorage.apply(this, arguments);
}

function _getSessionFromStorage() {
  _getSessionFromStorage = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof Storage !== "undefined")) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", Promise.resolve(localStorage.getItem("nakamaToken")));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _getSessionFromStorage.apply(this, arguments);
}

function restoreSessionOrAuthenticate() {
  return _restoreSessionOrAuthenticate.apply(this, arguments);
}

function _restoreSessionOrAuthenticate() {
  _restoreSessionOrAuthenticate = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var email, password, session, sessionString, currentTimeInSec;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            email = "hello@example.com";
            password = "somesupersecretpassword";
            session = null;
            _context2.prev = 3;
            _context2.next = 6;
            return getSessionFromStorage();

          case 6:
            sessionString = _context2.sent;

            if (!(sessionString && sessionString != "")) {
              _context2.next = 13;
              break;
            }

            session = nakamajs.Session.restore(sessionString);
            currentTimeInSec = new Date() / 1000;

            if (session.isexpired(currentTimeInSec)) {
              _context2.next = 13;
              break;
            }

            console.log("Restored session. User ID: %o", session.user_id);
            return _context2.abrupt("return", Promise.resolve(session));

          case 13:
            _context2.next = 15;
            return client.authenticateEmail({
              email: email,
              password: password
            });

          case 15:
            session = _context2.sent;
            storeSession(session);
            console.log("Authenticated successfully. User ID: %o", session.user_id);
            return _context2.abrupt("return", Promise.resolve(session));

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2["catch"](3);
            console.log("An error occured while trying to restore session or authenticateAndHandleSeesion user: %o", _context2.t0);

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 21]]);
  }));
  return _restoreSessionOrAuthenticate.apply(this, arguments);
}

restoreSessionOrAuthenticate().then(function (session) {
  currentSession = session;
  return client.writeStorageObjects(currentSession, [{
    "collection": "collection",
    "key": "key1",
    "value": {
      "jsonKey": "jsonValue"
    }
  }]);
}).then(function (writeAck) {
  console.log("Storage write was successful - ack: %o", writeAck);
}).catch(function (e) {
  console.log("An error occured: %o", e);
});