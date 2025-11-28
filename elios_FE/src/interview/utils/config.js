// API Configuration
const API_BASE_URL = process.env.REACT_APP_DEVELOPMENT_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  PLAN_INTERVIEW: `${API_BASE_URL}/api/ai/interviews/plan`,
  GET_PLANNING_STATUS: (interviewId) => `${API_BASE_URL}/api/ai/interviews/${interviewId}/plan`,
  START_INTERVIEW: (interviewId) => `${API_BASE_URL}/api/ai/interviews/${interviewId}/start`,
  UPLOAD_CV: `${API_BASE_URL}/api/ai/interviews/cv/upload`,
};

// WebSocket configuration
export const WS_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAYS: [3000, 5000, 10000, 20000, 30000], // Exponential backoff (3s, 5s, 10s, 20s, 30s)
};

// Timing constants
export const TIMEOUTS = {
  PLANNING: 30000, // 30 seconds
  POLLING_INTERVAL: 2000, // 2 seconds
};

// Interview status states (matches backend InterviewStatus enum)
export const INTERVIEW_STATUS = {
  PLANNING: 'PLANNING',
  IDLE: 'IDLE',
  QUESTIONING: 'QUESTIONING',
  EVALUATING: 'EVALUATING',
  FOLLOW_UP: 'FOLLOW_UP',
  COMPLETE: 'COMPLETE',
  CANCELLED: 'CANCELLED',
};

// Connection states
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  PLANNING: 'planning',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
};
