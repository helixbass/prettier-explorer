const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')

const app = express()
app.use(bodyParser.json())

app.use('/api/v1/prettier-format', require('./handlers/prettier-format'))

app.use((error, request, response, next) => {
  console.error((new Date).toLocaleString(), error)
  if (error.response) {
    response.status(error.response.status).send(error.response.statusText)
    return
  }
  response.status(500).send('Something went wrong')
})

if (process.env.STATIC) {
  app.use(express.static(path.join(__dirname, process.env.STATIC)))
}

const PORT = process.env.PORT || 8080
app.listen(
  PORT,
  'localhost',
  () => {
    console.log(`Server listening on port ${PORT}`)
  }
)
