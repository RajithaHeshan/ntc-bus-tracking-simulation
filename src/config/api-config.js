/**
 * API Configuration for GPS Simulator
 * Handles HTTP client settings and endpoint configurations
 */

import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

export const apiConfig = {
  // Base API URL
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  
  // Request timeout (ms) - increased for better reliability
  timeout: parseInt(process.env.API_TIMEOUT) || 10000, // Increased to 10 seconds
  
  // API Endpoints
  endpoints: {
    liveLocation: '/locations',
    tripStatus: '/trips/status', 
    health: '/health',
    buses: '/buses',
    routes: '/routes'
  },
  
  // Retry configuration - reduced retries for faster response
  retry: {
    maxAttempts: 2, // Reduced from 3 to 2
    delayBetweenRetries: 500, // Reduced from 1000ms to 500ms
    exponentialBackoff: false // Disabled for consistent timing
  },
  
  // Headers  
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Sri-Lanka-GPS-Simulator/1.0',
    'X-Device-Type': 'GPS-IoT-Device',
    'x-api-key': process.env.API_KEY || 'your-api-key-here'
  },
  
  // Batch settings
  batch: {
    enabled: process.env.BATCH_ENABLED !== 'false',
    size: parseInt(process.env.BATCH_SIZE) || 10,
    intervalMs: parseInt(process.env.BATCH_INTERVAL) || 5000
  }
};

export default apiConfig;