import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance for auth with proper config
const volunteerClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

const volunteerService = {
  // ========== DASHBOARD ==========
  
  getDashboardStats: async () => {
    const response = await volunteerClient.get('/volunteer/dashboard/stats', {
      withCredentials: true
    })
    return response.data
  },

  // ========== ISSUES ==========
  
  getAssignedIssues: async (params = {}) => {
    const response = await volunteerClient.get('/volunteer/issues', {
      params,
      withCredentials: true
    })
    return response.data
  },

  getActiveTasks: async (params = {}) => {
    // Get tasks with status 'in-progress' or 'in_review'
    const response = await volunteerClient.get('/volunteer/issues', {
      params: { ...params, status: 'in-progress' },
      withCredentials: true
    })
    return response.data
  },

  getCompletedTasks: async (params = {}) => {
    // Get tasks with status 'resolved'
    const response = await volunteerClient.get('/volunteer/issues', {
      params: { ...params, status: 'resolved' },
      withCredentials: true
    })
    return response.data
  },

  getIssueDetails: async (issueId) => {
    const response = await volunteerClient.get(`/volunteer/issues/${issueId}`, {
      withCredentials: true
    })
    return response.data
  },

  updateIssueStatus: async (issueId, status, notes = '') => {
    const response = await volunteerClient.put(`/volunteer/issues/${issueId}/status`, {
      status,
      notes
    }, {
      withCredentials: true
    })
    return response.data
  },

  markIssueComplete: async (issueId, completionData = {}) => {
    // Mark issue as complete with photos and notes
    const response = await volunteerClient.put(`/volunteer/issues/${issueId}/complete`, completionData, {
      withCredentials: true
    })
    return response.data
  },

  addComment: async (issueId, content) => {
    const response = await volunteerClient.post(`/volunteer/issues/${issueId}/comments`, {
      content
    }, {
      withCredentials: true
    })
    return response.data
  },

  // ========== HISTORY ==========
  
  getHistory: async (params = {}) => {
    const response = await volunteerClient.get('/volunteer/history', {
      params,
      withCredentials: true
    })
    return response.data
  },

  // ========== PERFORMANCE ==========
  
  getPerformance: async () => {
    const response = await volunteerClient.get('/volunteer/performance', {
      withCredentials: true
    })
    return response.data
  },

  getAchievements: async () => {
    const response = await volunteerClient.get('/volunteer/achievements', {
      withCredentials: true
    })
    return response.data
  },

  // ========== PROFILE ==========
  
  getProfile: async () => {
    const response = await volunteerClient.get('/volunteer/profile', {
      withCredentials: true
    })
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await volunteerClient.put('/volunteer/profile', profileData, {
      withCredentials: true
    })
    return response.data
  },

  // ========== MAP DATA ==========
  
  getMapData: async () => {
    const response = await volunteerClient.get('/volunteer/map-data', {
      withCredentials: true
    })
    return response.data
  },

  // ========== NOTIFICATIONS ==========
  
  getNotifications: async () => {
    const response = await volunteerClient.get('/volunteer/notifications', {
      withCredentials: true
    })
    return response.data
  },

  markNotificationRead: async (notificationId) => {
    const response = await volunteerClient.put(`/volunteer/notifications/${notificationId}/read`, {}, {
      withCredentials: true
    })
    return response.data
  },

  // ========== VOLUNTEER STATUS ==========
  
  getVolunteerStatus: async (email) => {
    const response = await volunteerClient.get(`/volunteer/status/${email}`, {
      withCredentials: true
    })
    return response.data
  }
}

export default volunteerService
