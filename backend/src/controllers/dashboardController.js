import { dashboardService } from '../services/dashboardService.js'

export async function adminDashboard(_req, res) {
  res.status(200).json(await dashboardService.getAdminStats())
}

export async function staffDashboard(_req, res) {
  res.status(200).json(await dashboardService.getStaffStats())
}

export async function participantDashboard(_req, res) {
  res.status(200).json(await dashboardService.getParticipantSummary())
}
