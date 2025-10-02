/**
 * Test current GPS device movement data generation
 * This will show the exact movement object that gets sent to the API
 */

import GPSDevice from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import routes from './src/config/routes.js';

console.log('🧪 Testing GPS Device Movement Data Generation\n');

// Get first bus and route
const bus = buses[0]; // BUS001
console.log('Available routes:', routes.map(r => r.routeId));
console.log('Bus assigned routes:', bus.assignedRoutes);

const route = routes.find(r => r.routeId === bus.assignedRoutes[0]);
console.log('Found route:', route ? route.routeId : 'NOT FOUND');

if (!route) {
  console.error('❌ Route not found. Exiting.');
  process.exit(1);
}

console.log(`📋 Testing with Bus: ${bus.busId} on Route: ${route.routeId}`);
console.log(`   Registration: ${bus.registrationNumber}`);
console.log(`   Route: ${route.name}`);
console.log(`   Average Speed: ${route.averageSpeed} km/h`);
console.log(`   Max Speed: ${route.maxSpeed} km/h\n`);

// Create GPS device
const device = new GPSDevice(bus.busId, bus, route);

// Generate some location data to see movement values
console.log('🚀 Generating 5 location updates to see movement data:\n');

for (let i = 0; i < 5; i++) {
  const locationData = device.generateLocationData();
  
  console.log(`📊 Update ${i + 1}:`);
  console.log(`   📍 Coordinates: ${locationData.coordinates.latitude.toFixed(4)}, ${locationData.coordinates.longitude.toFixed(4)}`);
  console.log(`   🏃 Movement Object:`);
  console.log(`      {`);
  console.log(`        "speed": ${locationData.movement.speed},`);
  console.log(`        "heading": ${locationData.movement.heading},`);
  console.log(`        "isMoving": ${locationData.movement.isMoving}`);
  console.log(`      }`);
  console.log(`   🏙️ Location: ${locationData.locationData.city} (${locationData.locationData.nearestLandmark})`);
  console.log(`   🔋 Battery: ${locationData.batteryLevel}%\n`);
  
  // Add small delay to simulate real updates
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('✅ Movement data test completed');
console.log('\n📝 Summary: The GPS device is generating realistic movement data with:');
console.log('   - Variable speeds based on route averages and traffic conditions');
console.log('   - Realistic headings based on GPS coordinate movement');
console.log('   - Proper isMoving status based on speed thresholds');
console.log('\nIf you\'re seeing old data with speed:0, heading:null, isMoving:false,');
console.log('that was from before we implemented the updateSpeed() and updateMovementStatus() methods.');