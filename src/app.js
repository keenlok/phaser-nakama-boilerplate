const express = require('express')
const http = require('http')
const path = require('path')

const app = express()
http.createServer(app)


app.use('/static', express.static('./src/client'))

app.get('/' , (req, res) => {
  res.sendFile(path.join(__dirname + '/test.html'))
})

app.get('/nakama-js.umd.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/../node_modules/@heroiclabs/nakama-js/dist/nakama-js.umd.js'))
})

app.get('/device-uuid.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/../node_modules/device-uuid/lib/device-uuid.js'))
})

app.get('/phaser.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/../node_modules/phaser/dist/phaser.js'))
})

app.listen(3300);