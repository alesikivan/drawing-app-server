require('dotenv').config()
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')
const cors = require('cors')

const { generateImages, limiter } = require('./controllers/ImageController')

const app = express()

const getTargetFromReq = (req) => {
  // URL: /api/proxy/encodeURIComponent(targetURL)
  const targetURL = decodeURIComponent(req.url).replace('/', '')
  return targetURL;
}

app.use('/proxy/api/', (req, res, next) => {
  const target = getTargetFromReq(req); // Функция, которая определяет целевой URL на основе запроса
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: function (proxyReq, req, res) {
      // Здесь можно добавить или изменить заголовки запроса
      proxyReq.setHeader('Authorization', 'Bearer ' + process.env.OPENAI_API_KEY);
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  });
  proxy(req, res, next);
});

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
