require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')

const { generateImages, limiter } = require('./controllers/ImageController')

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))

app.post('/generate-images', limiter, generateImages)

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
