let Phaser = require('phaser');
let nakamajs = require('@heroiclabs/nakama-js')
const verboseLogging = true;
const useSSL = false;

var currentSession = null;
var matchId = null;
var canPlay = false;

class Game extends Phaser.scene {

  constructor () {
    super('main');
    this.avatar = {};
  }

  preload() {
    this.load.image('avatar', './static/avatar.png')
  }

  create() {
    let client = new nakamajs.Client('defaultkey');
    client.verbose = verboseLogging;
    client.ssl = useSSL;
    this.authenticateAndHandleSession(client);
  }

  async authenticateAndHandleSession(client){
    const email = "keenloklai@gmail.com"
    const password = "3bc8f72e95a9"
    const randomUserId = new DeviceUUID().get();

    client.authenticateDevice({id: randomUserId, create: true, username: "mycustomusername"})
    .then(session => {
      console.info("Successfully authenticated:", session);
      // sessionHandler(session);
      this.gameSessionHandler(session);
    })
    .catch(error => {
      console.log("error : ", error);
    });

  }

  sessionHandler(session) {
    if (session) {
      console.info("Session expired?", session.isexpired(Date.now() / 1000));
    }
    const socket = client.createSocket(useSSL, verboseLogging)
    socket.connect(session).then(session => {
      socket.onchannelmessage = (channelMessage) => {
        console.info("Received chat message:", channelMessage)
      }

      const channelId = "pineapple-pizza-lovers-room";
      socket.send({ channel_join: {
          type: 1, // 1 = room, 2 = Direct Message, 3 = Group
          target: channelId,
          persistence: false,
          hidden: false
        } })
      .then(response => {
        console.info("Successfully joined channel:", response.channel.id);
        socket.send({ channel_message_send: {
            channel_id: response.channel.id,
            content: {"message": "Pineapple doesn't belong on a pizza!"}
          } })
        .then(messageAck => {
          console.info("Successfully sent chat message:", messageAck);
        })
        .catch(e => {
          console.log("error: ", e);
        })
      })
    })
  }

  gameSessionHandler(session) {
    const socket = client.createSocket(useSSL, verboseLogging)
    socket.connect(session).then(session => {
      // var id = "<matchid>";
      // console.log(id)
      // socket.send({ match_create: {} })
      // .then(response => {
      //   console.log("Created match with ID:", response.match.match_id)
      // })
      const message = { matchmaker_add: {
          min_count: 2,
          max_count: 4,
          query: "*",
          string_properties: {
            region: "europe"
          },
          numeric_properties: {
            rank: 8
          }
        }};
      let ticket;
      socket.send(message).then(ticket => {
        console.log("Ticket received", ticket);
        ticket = ticket;
      })

      socket.onmatchmakermatched = (matched) => {
        console.info("Received MatchmakerMatched message: ", matched);
        console.info("Matched opponents: ", matched.users);
        const message = {
          match_join: {
            token: matched.token
          }
        };
        socket.send(message).then(response => {
          console.log("Match join", response)
          matchId = response.match.match_id
        });
      }
    })
  }
}