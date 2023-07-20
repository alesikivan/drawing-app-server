require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
