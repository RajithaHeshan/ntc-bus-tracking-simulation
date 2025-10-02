/**
 * Debug GPS Location Payload
 * Check what data is being sent to the API
 */

import dotenv from 'dotenv';
import GPSDevice from './src/core/gps-device.js';
import buses from './src/config/buses.js';
import routes from './src/config/routes.js';

dotenv.config();

async function debugPayload() {
  try {
    console.log('🔍 Debugging GPS Location Payload\n');
    
    // Create a sample GPS device
    const bus = buses[0]; // First bus
    const route = routes.find(r => r.routeId === bus.assignedRoutes[0]);
    
    console.log(`📋 Testing with Bus: ${bus.busId} on Route: ${route.routeId}\n`);
    
    const gpsDevice = new GPSDevice(bus, route);
    
    // Generate location data
    const locationData = gpsDevice.generateLocationData();
    
    console.log('📦 Generated Location Data Payload:');
    console.log('=====================================');
    console.log(JSON.stringify(locationData, null, 2));
    console.log('=====================================\n');
    
    console.log('📊 Payload Analysis:');
    console.log(`• Total Fields: ${Object.keys(locationData).length}`);
    console.log(`• Required Fields Present:`);
    
    const expectedFields = [
      'locationId', 'tripId', 'busId', 'routeId', 'routeName', 'gpsDeviceId',
      'coordinates', 'movement', 'locationData', 'signalStrength', 
      'batteryLevel', 'timestamp', 'serverTimestamp', 'isValid', 'alerts'
    ];
    
    expectedFields.forEach(field => {
      const exists = field in locationData;
      const value = exists ? (typeof locationData[field] === 'object' ? '{...}' : locationData[field]) : 'MISSING';
      console.log(`  ${exists ? '✅' : '❌'} ${field}: ${value}`);
    });
    
    console.log('\n🔧 Nested Object Analysis:');
    if (locationData.coordinates) {
      console.log('  coordinates:');
      Object.keys(locationData.coordinates).forEach(key => {
        console.log(`    • ${key}: ${locationData.coordinates[key]}`);
      });
    }
    
    if (locationData.movement) {
      console.log('  movement:');
      Object.keys(locationData.movement).forEach(key => {
        console.log(`    • ${key}: ${locationData.movement[key]}`);
      });
    }
    
    if (locationData.alerts) {
      console.log('  alerts:');
      Object.keys(locationData.alerts).forEach(key => {
        console.log(`    • ${key}: ${locationData.alerts[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugPayload();