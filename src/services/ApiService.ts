/**
 * ApiService - Production Ready
 * Handles all backend communication with automatic environment detection
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONFIGURATION
// ============================================
// TODO: Replace with YOUR actual backend URL after deploying to Render/Railway/Fly.io
const PRODUCTION_API_URL = 'https://tiktokcoachapp.onrender.com';

// Automatic environment detection
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'        // Android emulator localhost
  : PRODUCTION_API_URL;             // Your deployed backend

console.log(`🌐 API Environment: ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log(`🔗 API URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 180000, // 3 minutes (for video uploads and AI processing)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (development only)
if (__DEV__) {
  api.interceptors.request.use(
    (config) => {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('📤 Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.error('📥 Response Error:', error.response?.status, error.message);
    }
    
    // Enhanced error messages for users
    if (!error.response) {
      // Network error
      error.userMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.response.status >= 500) {
      // Server error
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.response.status === 404) {
      // Not found
      error.userMessage = 'Requested resource not found.';
    } else if (error.response.status === 400) {
      // Bad request
      error.userMessage = error.response.data?.error || 'Invalid request.';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// API SERVICE
// ============================================
export const ApiService = {

  /**
   * Health Check
   * Verifies backend is running and ready
   */
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Select Niche
   * Initialize analysis with chosen niche
   */
  async selectNiche(niche: string) {
    try {
      const response = await api.post('/scrape/start', { 
        niche, 
        videoCount: 0 
      });
      return response.data;
    } catch (error) {
      console.error('Niche selection failed:', error);
      throw error;
    }
  },

  /**
   * Upload and Analyze Video
   * Uploads video file and gets AI analysis with timestamps
   */
  async uploadAndAnalyzeVideo(videoUri: string, fileName: string, niche: string) {
    try {
      const formData = new FormData();
      
      // Add video file
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: fileName,
      } as any);
      
      // Add niche
      formData.append('niche', niche);

      const response = await api.post('/video/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        timeout: 300000, // 5 minutes for large uploads
      });

      return response.data;
    } catch (error: any) {
      console.error('Video upload/analysis failed:', error);
      
      // Enhanced error for large files
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Upload timeout. Please try a smaller video.';
      }
      
      throw error;
    }
  },

  /**
   * Generate Coaching
   * Get personalized coaching based on analysis
   */
  async generateCoaching(data: { 
    niche: string; 
    analysis_id?: string; 
    job_id?: string;
  }) {
    try {
      const response = await api.post('/coaching/generate', data);
      return response.data;
    } catch (error) {
      console.error('Coaching generation failed:', error);
      throw error;
    }
  },

  /**
   * Ask Chat Question
   * Interactive Q&A with AI coach
   */
  async askQuestion(question: string, niche: string) {
    try {
      const response = await api.post('/chat/ask', { 
        question, 
        niche 
      });
      return response.data;
    } catch (error) {
      console.error('Chat question failed:', error);
      throw error;
    }
  },

};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if backend is reachable
 * Useful for showing connection status to users
 */
export const checkBackendStatus = async (): Promise<{
  connected: boolean;
  healthy: boolean;
  message: string;
}> => {
  try {
    const health = await ApiService.healthCheck();
    
    return {
      connected: true,
      healthy: health.status === 'healthy',
      message: health.genai_available 
        ? 'Backend connected and AI ready' 
        : 'Backend connected but AI unavailable'
    };
  } catch (error: any) {
    return {
      connected: false,
      healthy: false,
      message: error.userMessage || 'Unable to connect to backend'
    };
  }
};

/**
 * Get current API URL
 * Useful for debugging
 */
export const getApiUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};

export default ApiService;
