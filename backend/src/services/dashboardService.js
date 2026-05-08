export const dashboardService = {
  getAdminStats: async () => ({ totalParticipants: 0, checkedIn: 0 }),
  getStaffStats: async () => ({ pendingCheckIns: 0 }),
  getParticipantSummary: async () => ({ registrations: 0 }),
}
