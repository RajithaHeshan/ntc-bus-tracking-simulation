// Route registration fix for completion endpoint
// Add this to your main API routes

import liveLocationController from '../controllers/liveLocationController.js';

// If you have a router setup, add this line:
// router.post('/locations/complete', liveLocationController.createCompletedRoute);

// If you're using Express app directly, add this line to your main app.js:
// app.post('/api/locations/complete', liveLocationController.createCompletedRoute);

export default {
  // Route configuration
  completionRoute: {
    method: 'POST',
    path: '/api/locations/complete',
    handler: 'liveLocationController.createCompletedRoute'
  }
};