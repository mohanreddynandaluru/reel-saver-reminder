// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:3005/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('firebaseToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('userEmail');
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Notes API
  async getNotes() {
    return this.request('/notes');
  }

  async getNoteById(noteId) {
    return this.request(`/notes/${noteId}`);
  }

  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(noteId, noteData) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(noteId) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Reminders API
  async getReminders() {
    return this.request('/reminders');
  }

  async createReminder(reminderData) {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  async updateReminder(reminderId, reminderData) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  }

  async deleteReminder(reminderId) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'DELETE',
    });
  }

  // User API
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Statistics API
  async getStats() {
    return this.request('/stats');
  }

  // Search API
  async searchNotes(query) {
    return this.request(`/notes/search?q=${encodeURIComponent(query)}`);
  }
}

export default new ApiService(); 