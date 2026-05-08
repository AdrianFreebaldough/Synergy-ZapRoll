import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase() {
  if (!env.mongoUri) {
    return
  }

  await mongoose.connect(env.mongoUri)
}
