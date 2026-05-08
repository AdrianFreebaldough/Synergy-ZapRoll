import { Router } from 'express'
import { adminDashboard, staffDashboard, participantDashboard } from '../controllers/dashboardController.js'

const dashboardRoutes = Router()

dashboardRoutes.get('/admin', adminDashboard)
dashboardRoutes.get('/staff', staffDashboard)
dashboardRoutes.get('/participant', participantDashboard)

export default dashboardRoutes
