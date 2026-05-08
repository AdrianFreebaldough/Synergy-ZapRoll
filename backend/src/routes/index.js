import { Router } from 'express'
import authRoutes from './authRoutes.js'
import registrationRoutes from './registrationRoutes.js'
import qrRoutes from './qrRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'

const apiRouter = Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/registrations', registrationRoutes)
apiRouter.use('/qr', qrRoutes)
apiRouter.use('/dashboards', dashboardRoutes)

export default apiRouter
