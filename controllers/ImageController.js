const { Configuration, OpenAIApi } = require("openai")
const rateLimit = require('express-rate-limit')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const { default: axios } = require("axios")

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const getSize = (size) => {
  switch (size) {
    case 'small':
      return '256x256'
    
    case 'medium':
      return '512x512'
  
    default:
      return '1024x1024'
  }
}

async function getImageByUrl(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })

    const base64 = Buffer.from(response.data, 'binary').toString('base64')
    const prefix = 'data:image/png;base64,'

    return prefix + base64
  } catch (error) {
    console.log(error)
  }
}

const generateImages = async (req, res) => {
  try {
    const { prompt, size: imageSize } = req.body

    const amount = 2
    const size = getSize('small')

    const response = await openai.createImage({
      prompt: prompt,
      n: amount,
      size: size,
    })

    const urls = response.data.data.map(item => item.url)

    const images = []
    for (const url of urls) {
      const base64 = await getImageByUrl(url)

      images.push({ url, base64 })
    }
  
    return res.status(200).json({ images }) 
  } catch (error) {
    return res.status(400).json({ message: 'Server error. Try again later' })
  }
}

const LIMIT = 2
const TIME_LIMIT = 1 * 60 // Per 1 minute

const rateLimiter = new RateLimiterMemory({
  points: LIMIT,
  duration: TIME_LIMIT,
})

const limiter = rateLimit({
  windowMs: TIME_LIMIT * 1000,
  max: LIMIT,
  message: 'Too many requests, please try again later',
  handler: (req, res, next) => {
    rateLimiter.consume(req.socket.remoteAddress)
      .then(() => {
        next()
      })
      .catch(() => {
        res.status(429).json({ message: 'Too many requests, please try again later.' })
      })
  },
})

module.exports = {
  generateImages,
  limiter
}