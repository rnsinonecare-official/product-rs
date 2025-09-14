import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add request interceptor to include admin token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers['x-admin-api-key'] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTHENTICATION ====================
  async login(credentials) {
    try {
      const response = await this.api.post('/auth/admin-login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verify-admin');
      return response.data;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  // ==================== DASHBOARD ANALYTICS ====================
  async getDashboardStats() {
    try {
      const response = await this.api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  async getSystemHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch system health');
    }
  }

  // ==================== USER MANAGEMENT ====================
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      const response = await this.api.get('/admin/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await this.api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user details');
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const response = await this.api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user status');
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }

  // ==================== CONTENT MANAGEMENT ====================
  
  // Announcements
  async getAnnouncements() {
    try {
      const response = await this.api.get('/admin/announcements');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch announcements');
    }
  }

  async createAnnouncement(data) {
    try {
      const response = await this.api.post('/admin/announcements', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create announcement');
    }
  }

  async updateAnnouncement(id, data) {
    try {
      const response = await this.api.put(`/admin/announcements/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update announcement');
    }
  }

  async deleteAnnouncement(id) {
    try {
      const response = await this.api.delete(`/admin/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete announcement');
    }
  }

  // Updates
  async getUpdates() {
    try {
      const response = await this.api.get('/admin/updates');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch updates');
    }
  }

  async createUpdate(data) {
    try {
      const response = await this.api.post('/admin/updates', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create update');
    }
  }

  async updateUpdate(id, data) {
    try {
      const response = await this.api.put(`/admin/updates/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update update');
    }
  }

  async deleteUpdate(id) {
    try {
      const response = await this.api.delete(`/admin/updates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete update');
    }
  }

  // Health Tips
  async getHealthTips() {
    try {
      const response = await this.api.get('/admin/health-tips');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch health tips');
    }
  }

  async createHealthTip(data) {
    try {
      const response = await this.api.post('/admin/health-tips', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create health tip');
    }
  }

  async updateHealthTip(id, data) {
    try {
      const response = await this.api.put(`/admin/health-tips/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update health tip');
    }
  }

  async deleteHealthTip(id) {
    try {
      const response = await this.api.delete(`/admin/health-tips/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete health tip');
    }
  }

  // Success Stories
  async getSuccessStories() {
    try {
      const response = await this.api.get('/admin/success-stories');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch success stories');
    }
  }

  async createSuccessStory(data) {
    try {
      const response = await this.api.post('/admin/success-stories', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create success story');
    }
  }

  async updateSuccessStory(id, data) {
    try {
      const response = await this.api.put(`/admin/success-stories/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update success story');
    }
  }

  async deleteSuccessStory(id) {
    try {
      const response = await this.api.delete(`/admin/success-stories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete success story');
    }
  }

  // Doctors
  async getDoctors() {
    try {
      const response = await this.api.get('/admin/doctors');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch doctors');
    }
  }

  async createDoctor(data) {
    try {
      const response = await this.api.post('/admin/doctors', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create doctor');
    }
  }

  async updateDoctor(id, data) {
    try {
      const response = await this.api.put(`/admin/doctors/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update doctor');
    }
  }

  async deleteDoctor(id) {
    try {
      const response = await this.api.delete(`/admin/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete doctor');
    }
  }

  // ==================== TEMPORARY INTAKE MANAGEMENT ====================
  async getTempIntakeStats() {
    try {
      const response = await this.api.get('/admin/temp-intake/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch temp intake stats');
    }
  }

  async getTempIntakeData(date) {
    try {
      const response = await this.api.get(`/admin/temp-intake/data/${date}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch temp intake data');
    }
  }

  async resetTempIntake() {
    try {
      const response = await this.api.post('/temp-intake/reset');
      return response.data;
    } catch (error) {
      throw new Error('Failed to reset temp intake');
    }
  }

  async cleanupTempIntake() {
    try {
      const response = await this.api.post('/temp-intake/cleanup');
      return response.data;
    } catch (error) {
      throw new Error('Failed to cleanup temp intake');
    }
  }

  // ==================== ANALYTICS ====================
  async getAnalytics(period = '30d') {
    try {
      const response = await this.api.get('/admin/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analytics');
    }
  }

  async getUserGrowthStats() {
    try {
      const response = await this.api.get('/admin/analytics/user-growth');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user growth stats');
    }
  }

  async getContentEngagementStats() {
    try {
      const response = await this.api.get('/admin/analytics/content-engagement');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch content engagement stats');
    }
  }

  // ==================== SYSTEM MANAGEMENT ====================
  async getSystemLogs(page = 1, level = 'all') {
    try {
      const response = await this.api.get('/admin/system/logs', {
        params: { page, level }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch system logs');
    }
  }

  async getServerStats() {
    try {
      const response = await this.api.get('/admin/system/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch server stats');
    }
  }

  async clearCache() {
    try {
      const response = await this.api.post('/admin/system/clear-cache');
      return response.data;
    } catch (error) {
      throw new Error('Failed to clear cache');
    }
  }

  // ==================== BACKUP & EXPORT ====================
  async createBackup() {
    try {
      const response = await this.api.post('/admin/backup/create');
      return response.data;
    } catch (error) {
      throw new Error('Failed to create backup');
    }
  }

  async getBackups() {
    try {
      const response = await this.api.get('/admin/backup/list');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch backups');
    }
  }

  async downloadBackup(backupId) {
    try {
      const response = await this.api.get(`/admin/backup/download/${backupId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to download backup');
    }
  }

  async exportUserData(format = 'csv') {
    try {
      const response = await this.api.get('/admin/export/users', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to export user data');
    }
  }

  // ==================== NOTIFICATIONS ====================
  async sendBulkNotification(data) {
    try {
      const response = await this.api.post('/admin/notifications/bulk', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to send bulk notification');
    }
  }

  async getNotificationHistory() {
    try {
      const response = await this.api.get('/admin/notifications/history');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notification history');
    }
  }
}

const adminService = new AdminService();
export default adminService;