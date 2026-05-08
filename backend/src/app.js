import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import apiRouter from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/v1', apiRouter)
app.use(notFound)
app.use(errorHandler)

export default app
