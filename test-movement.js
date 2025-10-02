/**
 * Test movement data generation
 */

import { GPSDevice } from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import { routes } from './src/config/routes.js';

function testMovementData() {
    console.log('🔍 Testing Movement Data Generation\n');
    
    const testBus = buses[0];
    const testRoute = routes.find(r => testBus.assignedRoutes.includes(r.routeId));
    
    console.log(`📋 Testing with Bus: ${testBus.busId} on Route: ${testRoute.routeId}`);
    
    // Create GPS device
    const gpsDevice = new GPSDevice(testBus, testRoute);
    
    console.log('\n📡 Initial Movement State:');
    console.log(`   speed: ${gpsDevice.movement.speed}`);
    console.log(`   heading: ${gpsDevice.movement.heading}`);
    console.log(`   isMoving: ${gpsDevice.movement.isMoving}`);
    
    // Generate location data (should trigger movement updates)
    console.log('\n🚀 Generating location data...');
    const locationData = gpsDevice.generateLocationData();
    
    console.log('\n📊 Movement Data After Generation:');
    console.log(`   speed: ${gpsDevice.movement.speed}`);
    console.log(`   heading: ${gpsDevice.movement.heading}`);
    console.log(`   isMoving: ${gpsDevice.movement.isMoving}`);
    
    console.log('\n📍 Movement Data in Location Packet:');
    console.log(JSON.stringify(locationData.movement, null, 2));
    
    console.log('\n🔧 Route Info for Speed Calculation:');
    console.log(`   Route averageSpeed: ${testRoute.averageSpeed} km/h`);
    console.log(`   Route maxSpeed: ${testRoute.maxSpeed} km/h`);
}

testMovementData();