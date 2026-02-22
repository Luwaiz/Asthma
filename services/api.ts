import { auth } from '@/firebaseConfig';

const BASE_URL = 'http://172.20.10.3:5000/api';

const getHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const apiService = {
  getLogs: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/logs`, { headers });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Fetch logs failed with status ${response.status}:`, errorBody);
      throw new Error('Failed to fetch logs');
    }
    return response.json();
  },

  saveLog: async (logData: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(logData),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Save log failed with status ${response.status}:`, errorBody);
      throw new Error('Failed to save log');
    }
    return response.json();
  },

  // Medication Services
  getMedications: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/medications`, { headers });
    if (!response.ok) {
        if (response.status === 401) return []; // Graceful handle for unauth
        console.error(`Fetch medications failed: ${response.status}`);
        return [];
    }
    return response.json();
  },

  addMedication: async (medData: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/medications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(medData),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Add medication failed with status ${response.status}:`, errorBody);
        throw new Error('Failed to add medication');
    }
    return response.json();
  },

  deleteMedication: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/medications/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete medication');
    return response.json();
  },

  // Reminder Services
  getReminders: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/reminders`, { headers });
    if (!response.ok) {
        if (response.status === 401) return []; // Graceful handle for unauth
        console.error(`Fetch reminders failed: ${response.status}`);
        return [];
    }
    return response.json();
  },

  addReminder: async (reminderData: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/reminders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reminderData),
    });
    if (!response.ok) throw new Error('Failed to add reminder');
    return response.json();
  },

  deleteReminder: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete reminder');
    return response.json();
  },

  // User Profile Services
  getUserProfile: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/users/profile`, { headers });
    if (!response.ok) {
      console.error(`Fetch user profile failed: ${response.status}`);
      return null;
    }
    return response.json();
  },

  updateUserProfile: async (profileData: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Update user profile failed with status ${response.status}:`, errorBody);
      throw new Error('Failed to update user profile');
    }
    return response.json();
  },

  updatePushToken: async (pushToken: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ pushToken }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Update push token failed with status ${response.status}:`, errorBody);
      throw new Error('Failed to update push token');
    }
    return response.json();
  },

  verifyServer: async () => {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  deleteUser: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Delete user failed with status ${response.status}:`, errorBody);
        throw new Error(`Failed to delete user account: ${errorBody}`);
    }
    return response.json();
  },

  // AI Services
  getAIInsights: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/ai/insights`, { headers });
    if (!response.ok) {
      console.error(`Fetch AI insights failed: ${response.status}`);
      return null;
    }
    return response.json();
  },

  getAIHealthStatus: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${BASE_URL}/ai/status`, { headers });
    if (!response.ok) {
      console.error(`Fetch AI health status failed: ${response.status}`);
      return null;
    }
    return response.json();
  }
};
