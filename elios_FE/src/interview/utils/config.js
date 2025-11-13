// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Hardcoded UUIDs for development
export const DEV_CV_ANALYSIS_ID = '750e8400-e29b-41d4-a716-446655440001';
export const DEV_CANDIDATE_ID = '550e8400-e29b-41d4-a716-446655440001';

// API Endpoints
export const API_ENDPOINTS = {
  PLAN_INTERVIEW: `${API_BASE_URL}/api/interviews/plan`,
  GET_PLANNING_STATUS: (interviewId) => `${API_BASE_URL}/api/interviews/${interviewId}/plan`,
  START_INTERVIEW: (interviewId) => `${API_BASE_URL}/api/interviews/${interviewId}/start`,
};

// WebSocket configuration
export const WS_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAYS: [1000, 2000, 4000, 8000, 16000], // Exponential backoff
};

// Timing constants
export const TIMEOUTS = {
  PLANNING: 30000, // 30 seconds
  POLLING_INTERVAL: 2000, // 2 seconds
};

// Connection states
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  PLANNING: 'planning',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
};
