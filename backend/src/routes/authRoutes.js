import { Router } from 'express'
import { login, me } from '../controllers/authController.js'

const authRoutes = Router()

authRoutes.post('/login', login)
authRoutes.get('/me', me)

export default authRoutes
