import { Router } from 'express'
import { login, me } from '../controllers/authController.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const authRoutes = Router()

authRoutes.post('/login', authRateLimiter, login)
authRoutes.get('/me', me)

export default authRoutes
