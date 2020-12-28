const express = require('express')
const os = require('os')

const app = express()
app.get('/', (req, res) => {
        res.send(`Hi from ${os.hostname()}!`)
})

const port = 5000
app.listen(port, () => console.log(`listening on port ${port}`))
//routes
app.use(require('./routes/index'));

