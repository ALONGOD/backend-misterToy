import http from 'http'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { setupSocketAPI } from './services/socket.service.js'
import { logger } from './services/logger.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

logger.info('server.js loaded...')

const app = express()
const server = http.createServer(app) // Create an HTTP server

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
  // Serve static files in production
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true
  }
  app.use(cors(corsOptions))
}

// Routes
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)

// Handle unmatched routes to serve the SPA
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Setup Socket.IO
setupSocketAPI(server) // Integrate Socket.IO with the HTTP server

const port = process.env.PORT || 3030

server.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
