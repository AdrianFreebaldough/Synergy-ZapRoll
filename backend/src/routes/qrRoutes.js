import { Router } from 'express'
import { generateCategoryQr } from '../controllers/qrController.js'

const qrRoutes = Router()

qrRoutes.get('/:category', generateCategoryQr)

export default qrRoutes
