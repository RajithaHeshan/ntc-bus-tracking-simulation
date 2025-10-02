/**
 * Test GPS Device Location Data Generation
 * Debug actual GPS device output
 */

import { GPSDevice } from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import { routes } from './src/config/routes.js';

function testGPSDeviceOutput() {
    console.log('🧪 Testing GPS Device Location Data Output...\n');
    
    // Get first bus and route
    const testBus = buses[0];
    const testRoute = routes.find(r => testBus.assignedRoutes.includes(r.routeId));
    
    console.log(`Testing with Bus: ${testBus.busId} (${testBus.registrationNumber})`);
    console.log(`Route: ${testRoute.routeId} - ${testRoute.routeName}\n`);
    
    // Create GPS device
    const gpsDevice = new GPSDevice(testBus, testRoute);
    
    // Generate location data
    const locationData = gpsDevice.generateLocationData();
    
    console.log('📍 Generated Location Data:');
    console.log('================================');
    console.log(JSON.stringify(locationData, null, 2));
    
    // Focus on location data fields
    console.log('\n🎯 Location Data Fields:');
    console.log('========================');
    console.log(`Address: "${locationData.locationData.address}"`);
    console.log(`City: "${locationData.locationData.city}"`);
    console.log(`Nearest Landmark: "${locationData.locationData.nearestLandmark}"`);
    console.log(`Road Name: "${locationData.locationData.roadName}"`);
    
    // Check if empty
    const isEmpty = (str) => !str || str.trim() === '';
    
    if (isEmpty(locationData.locationData.address) || 
        isEmpty(locationData.locationData.city) || 
        isEmpty(locationData.locationData.nearestLandmark) || 
        isEmpty(locationData.locationData.roadName)) {
        console.log('\n❌ Some location data fields are EMPTY!');
    } else {
        console.log('\n✅ All location data fields have values!');
    }
}

testGPSDeviceOutput();