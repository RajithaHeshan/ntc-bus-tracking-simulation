/**
 * API Connection Test
 * Tests connectivity to the main bus tracking API
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import APIClient from '../services/api-client.js';

dotenv.config();

async function testAPIConnection() {
  console.log(chalk.blue.bold('🧪 API Connection Test\n'));
  
  try {
    const apiClient = new APIClient();
    
    // Display configuration
    const stats = apiClient.getStats();
    console.log(chalk.yellow('📊 API Configuration:'));
    console.log(`   Base URL: ${stats.baseURL}`);
    console.log(`   Timeout: ${stats.timeout}ms`);
    console.log(`   Batch Enabled: ${stats.batchEnabled}`);
    console.log(`   Max Retries: ${stats.retryConfig.maxAttempts}\n`);
    
    // Test health endpoint
    console.log(chalk.cyan('🔍 Testing health endpoint...'));
    const healthResult = await apiClient.checkHealth();
    
    if (healthResult.success) {
      console.log(chalk.green('✅ Health check passed'));
      console.log(`   API Status: ${healthResult.data?.status || 'Unknown'}`);
      console.log(`   Database: ${healthResult.data?.database?.connected ? 'Connected' : 'Disconnected'}`);
    } else {
      console.log(chalk.red('❌ Health check failed'));
      console.log(`   Error: ${healthResult.error}`);
    }
    
    console.log();
    
    // Test location endpoint with sample data
    console.log(chalk.cyan('📍 Testing location endpoint...'));
    const sampleLocationData = {
      locationId: `TEST_LOC_${Date.now()}`,
      tripId: `TEST_TRIP_${Date.now()}`,
      busId: 'BUS001',
      gpsDeviceId: 'GPS_TEST_001',
      coordinates: {
        latitude: 6.9271,
        longitude: 79.8612,
        accuracy: 15.0,
        altitude: 8.5
      },
      movement: {
        speed: 45.3,
        heading: 87,
        isMoving: true
      },
      signalStrength: 'good',
      batteryLevel: 87,
      timestamp: new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      isValid: true,
      alerts: {
        speedingAlert: false,
        routeDeviationAlert: false,
        emergencyAlert: false,
        maintenanceAlert: false
      }
    };
    
    const locationResult = await apiClient.sendLocationUpdate(sampleLocationData);
    
    if (locationResult.success) {
      console.log(chalk.green('✅ Location update test passed'));
      console.log(`   Response: ${JSON.stringify(locationResult.data, null, 2)}`);
    } else {
      console.log(chalk.red('❌ Location update test failed'));
      console.log(`   Error: ${locationResult.error}`);
    }
    
    console.log();
    
    // Test bus info endpoint
    console.log(chalk.cyan('🚌 Testing bus info endpoint...'));
    const busResult = await apiClient.getBusInfo('BUS001');
    
    if (busResult.success) {
      console.log(chalk.green('✅ Bus info test passed'));
      console.log(`   Bus Data: ${JSON.stringify(busResult.data, null, 2)}`);
    } else {
      console.log(chalk.yellow('⚠️  Bus info test warning'));
      console.log(`   Error: ${busResult.error}`);
    }
    
    console.log();
    
    // Test route info endpoint  
    console.log(chalk.cyan('🛣️  Testing route info endpoint...'));
    const routeResult = await apiClient.getRouteInfo('RT001');
    
    if (routeResult.success) {
      console.log(chalk.green('✅ Route info test passed'));
      console.log(`   Route Data: ${JSON.stringify(routeResult.data, null, 2)}`);
    } else {
      console.log(chalk.yellow('⚠️  Route info test warning'));
      console.log(`   Error: ${routeResult.error}`);
    }
    
    console.log();
    
    // Summary
    const totalTests = 4;
    const passedTests = [healthResult.success, locationResult.success, busResult.success, routeResult.success]
      .filter(Boolean).length;
    
    console.log(chalk.blue.bold('📊 Test Summary:'));
    console.log(`   Passed: ${passedTests}/${totalTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      console.log(chalk.green.bold('\n🎉 All tests passed! API is ready for GPS data.'));
    } else if (passedTests >= 2) {
      console.log(chalk.yellow.bold('\n⚠️  Some tests failed, but core functionality is working.'));
    } else {
      console.log(chalk.red.bold('\n❌ Multiple test failures. Check API connection and endpoints.'));
    }
    
  } catch (error) {
    console.error(chalk.red.bold('💥 Test execution failed:'), error.message);
    process.exit(1);
  }
}

testAPIConnection();