const express = require('express')
const os = require('os')
const bodyParser = require('body-parser')
const app = express()
app.get('/', (req, res) => {
        res.send(`Hi from ${os.hostname()}!`)
})


const port = 5000
app.listen(port, () => console.log(`listening on port ${port}`))

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

//routes
app.use(require('./routes/index'));