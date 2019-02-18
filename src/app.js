const express = require('express')
const http = require('http')
const path = require('path')

const app = express()
http.createServer(app)


app.use('/files', express.static('./src/client'))

app.get('/' , (req, res) => {
  res.sendFile(path.join(__dirname + '/../dist/public/index.html'))
})

app.get('/index.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/../dist/public/index.js'))
})

app.listen(3300);