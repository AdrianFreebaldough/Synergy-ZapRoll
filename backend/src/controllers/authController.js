import { authService } from '../services/authService.js'

export async function login(req, res) {
  const result = await authService.login(req.body)
  res.status(200).json(result)
}

export async function me(_req, res) {
  res.status(200).json({ user: null })
}
