import { API_ENDPOINTS, TIMEOUTS, DEV_CV_ANALYSIS_ID, DEV_CANDIDATE_ID } from './config';

class ApiService {
  async planInterview() {
    try {
      const response = await fetch(API_ENDPOINTS.PLAN_INTERVIEW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_analysis_id: DEV_CV_ANALYSIS_ID,
          candidate_id: DEV_CANDIDATE_ID,
        }),
      });

      if (!response.ok) {
        throw new Error(`Plan interview failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('planInterview error:', error);
      throw error;
    }
  }

  async getPlanningStatus(interviewId) {
    try {
      const response = await fetch(API_ENDPOINTS.GET_PLANNING_STATUS(interviewId), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Get planning status failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('getPlanningStatus error:', error);
      throw error;
    }
  }

  async startInterview(interviewId) {
    try {
      const response = await fetch(API_ENDPOINTS.START_INTERVIEW(interviewId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Start interview failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('startInterview error:', error);
      throw error;
    }
  }

  async pollPlanningStatus(interviewId, onStatusUpdate) {
    const startTime = Date.now();
    let pollInterval;

    const cleanup = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    return new Promise((resolve, reject) => {
      pollInterval = setInterval(async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > TIMEOUTS.PLANNING) {
            cleanup();
            reject(new Error('Planning timeout after 30 seconds'));
            return;
          }

          const statusResponse = await this.getPlanningStatus(interviewId);

          // Notify status update
          if (onStatusUpdate) {
            onStatusUpdate(statusResponse);
          }

          // Check if ready
          if (statusResponse.status.toUpperCase() === 'READY') {
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

      const response = await fetch(API_ENDPOINTS.UPLOAD_CV, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`CV upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('uploadCV error:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
