/**
 * API Client for sending GPS data to the main bus tracking API
 * Handles HTTP requests, retries, and error handling
 */

import axios from 'axios';
import { apiConfig } from '../config/api-config.js';

export class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: apiConfig.headers
    });
    
    this.setupInterceptors();
    this.pendingRequests = new Map();
    this.batchQueue = [];
    
    console.log(`🌐 API Client initialized with base URL: ${apiConfig.baseURL}`);
  }
  
  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = new Date().toISOString();
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error.message);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Send live location data to API
   */
  async sendLocationUpdate(locationData) {
    try {
      // Debug: Log what we're sending
      console.log('🔍 Debug - Sending payload:', JSON.stringify(locationData, null, 2));
      console.log('🔍 Debug - Headers:', JSON.stringify(this.client.defaults.headers, null, 2));
      
      const response = await this.makeRequest('POST', apiConfig.endpoints.liveLocation, locationData);
      
      if (response?.status === 200 || response?.status === 201) {
        console.log(`📍 Location update sent for bus ${locationData.busId} - ${response.status}`);
        return { success: true, data: response.data };
      } else {
        console.warn(`⚠️  Unexpected response status: ${response?.status}`);
        return { success: false, error: `Unexpected status: ${response?.status}` };
      }
      
    } catch (error) {
      console.error(`❌ Failed to send location for bus ${locationData.busId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send multiple location updates in batch
   */
  async sendBatchLocationUpdate(locationDataArray) {
    if (!apiConfig.batch.enabled) {
      // Send individually if batching is disabled
      const results = [];
      for (const locationData of locationDataArray) {
        const result = await this.sendLocationUpdate(locationData);
        results.push(result);
      }
      return results;
    }
    
    try {
      const response = await this.makeRequest('POST', `${apiConfig.endpoints.liveLocation}/batch`, {
        locations: locationDataArray,
        batchSize: locationDataArray.length,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📦 Batch location update sent for ${locationDataArray.length} buses`);
      return { success: true, data: response.data, count: locationDataArray.length };
      
    } catch (error) {
      console.error(`❌ Failed to send batch location update:`, error.message);
      return { success: false, error: error.message, count: locationDataArray.length };
    }
  }
  
  /**
   * Update trip status
   */
  async updateTripStatus(tripData) {
    try {
      const response = await this.makeRequest('POST', apiConfig.endpoints.tripStatus, tripData);
      
      console.log(`🎫 Trip status updated for ${tripData.tripId}`);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error(`❌ Failed to update trip status:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send route completion data to API
   */
  async sendRouteCompletion(completionData) {
    try {
      // Send completion data to dedicated completion endpoint
      const response = await this.makeRequest('POST', apiConfig.endpoints.liveLocationComplete, completionData);
      
      if (response?.status === 200 || response?.status === 201) {
        console.log(`🏁 Route completion sent for bus ${completionData.busId} - ${response.status}`);
        return { success: true, data: response.data };
      } else {
        console.warn(`⚠️  Unexpected response status: ${response?.status}`);
        return { success: false, error: `Unexpected status: ${response?.status}` };
      }
      
    } catch (error) {
      console.error(`❌ Failed to send route completion for bus ${completionData.busId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('GET', apiConfig.endpoints.health);
      
      if (response?.status === 200) {
        console.log('✅ API health check passed');
        return { success: true, data: response.data };
      } else {
        console.warn(`⚠️  API health check returned status: ${response?.status}`);
        return { success: false, error: `Health check failed: ${response?.status}` };
      }
      
    } catch (error) {
      console.error('❌ API health check failed:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get bus information from API
   */
  async getBusInfo(busId) {
    try {
      const response = await this.makeRequest('GET', `${apiConfig.endpoints.buses}/${busId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Failed to get bus info for ${busId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get route information from API
   */
  async getRouteInfo(routeId) {
    try {
      const response = await this.makeRequest('GET', `${apiConfig.endpoints.routes}/${routeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Failed to get route info for ${routeId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(method, url, data = null, retryCount = 0) {
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.client.get(url);
          break;
        case 'POST':
          response = await this.client.post(url, data);
          break;
        case 'PUT':
          response = await this.client.put(url, data);
          break;
        case 'DELETE':
          response = await this.client.delete(url);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response;
      
    } catch (error) {
      if (retryCount < apiConfig.retry.maxAttempts) {
        const delay = apiConfig.retry.exponentialBackoff 
          ? apiConfig.retry.delayBetweenRetries * Math.pow(2, retryCount)
          : apiConfig.retry.delayBetweenRetries;
          
        console.log(`🔄 Retrying request in ${delay}ms (attempt ${retryCount + 1}/${apiConfig.retry.maxAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(method, url, data, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Handle response errors
   */
  handleResponseError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          console.error('🚫 Bad Request:', message);
          break;
        case 401:
          console.error('🔐 Unauthorized:', message);
          break;
        case 403:
          console.error('⛔ Forbidden:', message);
          break;
        case 404:
          console.error('🔍 Not Found:', message);
          break;
        case 429:
          console.error('⏰ Rate Limited:', message);
          break;
        case 500:
          console.error('💥 Server Error:', message);
          break;
        default:
          console.error(`❌ HTTP Error ${status}:`, message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('🔌 Network Error: No response from server');
    } else {
      // Other error
      console.error('❌ Request Error:', error.message);
    }
  }
  
  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Add location data to batch queue
   */
  addToBatch(locationData) {
    this.batchQueue.push(locationData);
    
    if (this.batchQueue.length >= apiConfig.batch.size) {
      this.processBatch();
    }
  }
  
  /**
   * Process queued batch requests
   */
  async processBatch() {
    if (this.batchQueue.length === 0) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    try {
      await this.sendBatchLocationUpdate(batch);
    } catch (error) {
      console.error('❌ Failed to process batch:', error.message);
      // Could implement retry logic for failed batches
    }
  }
  
  /**
   * Get client statistics
   */
  getStats() {
    return {
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      batchQueueSize: this.batchQueue.length,
      batchEnabled: apiConfig.batch.enabled,
      retryConfig: apiConfig.retry
    };
  }
  
  /**
   * Test API connectivity
   */
  async testConnection() {
    console.log('🧪 Testing API connection...');
    
    const healthCheck = await this.checkHealth();
    
    if (healthCheck.success) {
      console.log('✅ API connection test passed');
      console.log('📊 API Status:', healthCheck.data);
      return true;
    } else {
      console.error('❌ API connection test failed:', healthCheck.error);
      return false;
    }
  }
}

export default APIClient;