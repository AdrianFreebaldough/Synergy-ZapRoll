import { Router } from 'express'
import { createRegistration } from '../controllers/registrationController.js'

const registrationRoutes = Router()

registrationRoutes.post('/', createRegistration)

export default registrationRoutes
