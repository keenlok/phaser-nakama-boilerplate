let Phaser = require('phaser')
let nakamajs = require('@heroiclabs/nakama-js')
let uuid_v4 = require('uuid/v4')
const verboseLogging = true
const useSSL = false

const MOVE_OPCODE = 1

let currentSession = null
let matchId = null
let canPlay = false

class MainScene extends Phaser.Scene {

  constructor () {
    super({key: 'main'})
    this.avatar = {}
  }

  preload() {
    this.load.image('avatar', './files/avatar.png')
  }

  create() {
    let client = new nakamajs.Client('defaultkey')
    client.verbose = verboseLogging
    client.ssl = useSSL
    this.authenticateAndHandleSession(client)
    this.cameras.main.backgroundColor.setTo(255,255,255)
  }

  async authenticateAndHandleSession(client){
    const email = "keenloklai@gmail.com"
    const password = "3bc8f72e95a9"
    const randomUserId = uuid_v4()

    // username: "user" can be added to the function below to authenticate user.
    // Else a random username will be assigned to the user
    client.authenticateDevice({id: randomUserId, create: true})
    .then(session => {
      console.info("Successfully authenticated:", session)
      // sessionHandler(session);
      this.gameSessionHandler(session, client)
    })
    .catch(error => {
      console.log("error : ", error)
    })

  }

  gameSessionHandler(session, client) {
    this.id = session.username
    this.avatar[this.id] = this.add.sprite(0, 0, "avatar").setScale(0.25)
    const socket = client.createSocket(useSSL, verboseLogging)
    socket.connect(session).then(session => {
      // var id = "<matchid>";
      // console.log(id)
      // socket.send({ match_create: {} })
      // .then(response => {
      //   console.log("Created match with ID:", response.match.match_id)
      // })
      const message = { matchmaker_add: {
          min_count: 3,
          max_count: 3,
          query: "*",
          string_properties: {
            region: "europe"
          },
          numeric_properties: {
            rank: 8
          }
        }}
      let ticket
      socket.send(message).then(ticket => {
        console.log("Ticket received", ticket)
        ticket = ticket
      })
      socket.onmatchmakermatched = (matched) => {
        console.info("Received MatchmakerMatched message: ", matched);
        console.info("Matched opponents: ", matched.users);
        this.connectedOpponents = matched.users
        this.addPlayers(matched.users)
        const message = {
          match_join: {
            match_id: matched.match_id
          }
        }
        socket.send(message).then(response => {
          console.log("Match join", response)
          matchId = response.match.match_id
        })
      }
    })

    this.createListeners(socket)
    this.handleUsers(socket)
  }

  createListeners (socket) {
  // for sending mouse information
    this.input.on('pointermove', ({x, y}) => {
      let id = matchId
      let opCode = MOVE_OPCODE
      let data = {x, y}
      const message = {
        match_data_send:
          {match_id: id, op_code: opCode, data: data}
      }
      socket.send(message)
      // .then(response => {
      //   console.log('Data sent', response)
      //   this.avatar[this.id].x = x
      //   this.avatar[this.id].y = y
      // })
    })

    // Handle received data from match
    socket.onmatchdata = (result) => {
      let content = result.data
      switch (result.op_code) {
        case MOVE_OPCODE:
          console.log(content, result)
          let id = result.presence.username
          this.avatar[id].x = content.x
          this.avatar[id].y = content.y
          break
        default:
          console.log('Error: wrong op_code', result)
          break
      }
    }
  }

  handleUsers(socket) {
    let self = this
    socket.onmatchpresence = (presences) => {
      // Remove all users who left.
      self.connectedOpponents = self.connectedOpponents.filter((co) => {
        let stillConnectedOpponent = true;
        if (presences.leaves !== undefined) {
          for (let i = 0; i < presences.leaves.length; i++) {
            let leftOpponent = presences.leaves[i]
            console.log("Someone left", leftOpponent, co)
            if (leftOpponent.user_id == co.presence.user_id) {
              stillConnectedOpponent = false;
              console.log("Player removed", self.avatar)
              self.avatar[leftOpponent.username].destroy()
            }
          }
        }
        return stillConnectedOpponent;
      })
      console.log("Remaining opponents", self.connectedOpponents)

      // Add all users who joined.
      self.connectedOpponents = self.connectedOpponents.concat(presences.joins);
    }
  }

  addPlayers(users) {
    for (let i = 0; i < users.length; i++) {
      let id = users[i].presence.username
      if (this.avatar[id] !== undefined) {
        continue
      }
      this.avatar[id] = this.add.sprite(0, 0, "avatar").setScale(0.25)
    }
  }

}

const game = new Phaser.Game({
  scene: [MainScene],
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
})

const resizeGameToFullScreen = () => {
  game.resize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', resizeGameToFullScreen)
window.addEventListener('load', resizeGameToFullScreen)