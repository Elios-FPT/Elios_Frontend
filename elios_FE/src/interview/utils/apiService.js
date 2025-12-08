import axios from 'axios';
import { API_ENDPOINTS, TIMEOUTS, INTERVIEW_STATUS } from './config';

const apiClient = axios.create({
  baseURL: '', 

  timeout: 30000, 

  withCredentials: true, 

  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  async planInterview(cvAnalysisId, candidateId) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PLAN_INTERVIEW, {
        cv_analysis_id: cvAnalysisId,
        candidate_id: candidateId,
      });

      return response.data;
    } catch (error) {
      console.error('planInterview error:', error);
      throw error;
    }
  }

  async getPlanningStatus(interviewId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PLANNING_STATUS(interviewId));
      return response.data;
    } catch (error) {
      console.error('getPlanningStatus error:', error);
      throw error;
    }
  }

  async startInterview(interviewId) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.START_INTERVIEW(interviewId));
      return response.data;
    } catch (error) {
      console.error('startInterview error:', error);
      throw error;
    }
  }

  async pollPlanningStatus(interviewId, onStatusUpdate) {
    const startTime = Date.now();
    let pollInterval = null;

    const cleanup = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    return new Promise((resolve, reject) => {
      pollInterval = setInterval(async () => {
        try {

          if (Date.now() - startTime > TIMEOUTS.PLANNING) {
            cleanup();
            return reject(new Error('Planning timeout after 30 seconds'));
          }

          const statusResponse = await this.getPlanningStatus(interviewId);

          if (onStatusUpdate) {
            onStatusUpdate(statusResponse);
          }

          if (statusResponse.status.toUpperCase() === INTERVIEW_STATUS.IDLE) {
            cleanup();
            resolve(statusResponse);
          }
        } catch (error) {
          cleanup();
          reject(error);
        }
      }, TIMEOUTS.POLLING_INTERVAL);
    });
  }

  async uploadCV(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.create({
        withCredentials: true,
        timeout: 60000, 

      }).post(API_ENDPOINTS.UPLOAD_CV, formData);

      return response.data;
    } catch (error) {
      console.error('uploadCV error:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;