const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const api = {
  // Auth
  login: (body) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  register: (body) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getProfile: () => fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() }).then(handleResponse),
  updateProfile: (body) => fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Vehicles
  getVehicles: () => fetch(`${API_BASE}/vehicles`, { headers: getHeaders() }).then(handleResponse),
  addVehicle: (body) => fetch(`${API_BASE}/vehicles`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getVehicle: (id) => fetch(`${API_BASE}/vehicles/${id}`, { headers: getHeaders() }).then(handleResponse),
  updateVehicle: (id, body) => fetch(`${API_BASE}/vehicles/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteVehicle: (id) => fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Service Centers
  getServiceCenters: (params = '') => fetch(`${API_BASE}/service-centers?${params}`, { headers: getHeaders() }).then(handleResponse),
  getServiceCenter: (id) => fetch(`${API_BASE}/service-centers/${id}`, { headers: getHeaders() }).then(handleResponse),

  // Bookings
  getBookings: () => fetch(`${API_BASE}/bookings`, { headers: getHeaders() }).then(handleResponse),
  createBooking: (body) => fetch(`${API_BASE}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateBooking: (id, body) => fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  cancelBooking: (id) => fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Service Records
  getServiceRecords: (vehicleId = '') => fetch(`${API_BASE}/services?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  addServiceRecord: (body) => fetch(`${API_BASE}/services`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Marketplace
  getAccessories: (params = '') => fetch(`${API_BASE}/marketplace?${params}`).then(handleResponse),
  getAccessory: (id) => fetch(`${API_BASE}/marketplace/${id}`).then(handleResponse),

  // Orders
  getOrders: () => fetch(`${API_BASE}/orders`, { headers: getHeaders() }).then(handleResponse),
  createOrder: (body) => fetch(`${API_BASE}/orders`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Reviews
  getReviews: (params = '') => fetch(`${API_BASE}/reviews?${params}`).then(handleResponse),
  createReview: (body) => fetch(`${API_BASE}/reviews`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch(`${API_BASE}/notifications`, { headers: getHeaders() }).then(handleResponse),
  markAsRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),
  markAllAsRead: () => fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT', headers: getHeaders() }).then(handleResponse),

  // Telematics
  getTelematicsData: (vehicleId = '') => fetch(`${API_BASE}/telematics?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  getTelematicsSummary: (vehicleId = '') => fetch(`${API_BASE}/telematics/summary?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),

  // Analytics
  getExpenseAnalytics: (vehicleId = '') => fetch(`${API_BASE}/analytics/expenses?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  getMaintenanceScore: (vehicleId = '') => fetch(`${API_BASE}/analytics/maintenance-score?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  getRidingSummary: (vehicleId = '') => fetch(`${API_BASE}/analytics/riding-summary?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),

  // Maintenance Logs
  getMaintenanceLogs: (vehicleId = '') => fetch(`${API_BASE}/maintenance-logs?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  addMaintenanceLog: (body) => fetch(`${API_BASE}/maintenance-logs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateMaintenanceLog: (id, body) => fetch(`${API_BASE}/maintenance-logs/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteMaintenanceLog: (id) => fetch(`${API_BASE}/maintenance-logs/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Vehicle Upgrades
  getVehicleUpgrades: (vehicleId = '') => fetch(`${API_BASE}/vehicle-upgrades?vehicleId=${vehicleId}`, { headers: getHeaders() }).then(handleResponse),
  addVehicleUpgrade: (body) => fetch(`${API_BASE}/vehicle-upgrades`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteVehicleUpgrade: (id) => fetch(`${API_BASE}/vehicle-upgrades/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

export default api;
