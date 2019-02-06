var nakamajs = require('@heroiclabs/nakama-js/dist/nakama-js.umd');

// var client = new nakamajs.Client("defaultkey", "127.0.0.1", 7350);
// client.ssl = false;

var client = new nakamajs.Client("defaultkey");
var currentSession = null;

function storeSession(session) {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("nakamaToken", session.token);
    console.log("Session stored.");
  } else {
    // We'll assume this is a React Native project.
    // AsyncStorage.setItem('@MyApp:nakamaToken', session.token).then(function(session) {
    //   console.log("Session stored.");
    // }).catch(function(error) {
    //   console.log("An error occured while storing session: %o", error);
    // })
  }
}

async function getSessionFromStorage() {
  if (typeof(Storage) !== "undefined") {
    return Promise.resolve(localStorage.getItem("nakamaToken"));
  } else {
    // try {
    //   // Example assumes you use React Native.
    //   return AsyncStorage.getItem('@MyApp:nakamaToken');
    // } catch(e) {
    //   console.log("Could not fetch data, error: %o", error);
    // }
  }
}

async function restoreSessionOrAuthenticate() {
  const email = "hello@example.com";
  const password = "somesupersecretpassword";
  var session = null;
  try {
    var sessionString = await getSessionFromStorage();
    if (sessionString && sessionString != "") {
      session = nakamajs.Session.restore(sessionString);
      var currentTimeInSec = new Date() / 1000;
      if (!session.isexpired(currentTimeInSec)) {
        console.log("Restored session. User ID: %o", session.user_id);
        return Promise.resolve(session);
      }
    }

    session = await client.authenticateEmail({ email: email, password: password });
    storeSession(session);

    console.log("Authenticated successfully. User ID: %o", session.user_id);
    return Promise.resolve(session);
  } catch(e) {
    console.log("An error occured while trying to restore session or authenticateAndHandleSeesion user: %o", e)
  }
}

restoreSessionOrAuthenticate().then(function(session) {
  currentSession = session;
  return client.writeStorageObjects(currentSession, [{
    "collection": "collection",
    "key": "key1",
    "value": {"jsonKey": "jsonValue"}
  }]);
}).then(function(writeAck) {
  console.log("Storage write was successful - ack: %o", writeAck);
}).catch(function(e) {
  console.log("An error occured: %o", e);
});