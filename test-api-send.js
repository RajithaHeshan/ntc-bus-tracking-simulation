/**
 * Test sending location data to API
 * Debug what happens when we send location data
 */

import { APIClient } from './src/services/api-client.js';
import { GPSDevice } from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import { routes } from './src/config/routes.js';

async function testSendingLocationData() {
    console.log('🧪 Testing Sending Location Data to API...\n');
    
    // Get first bus and route
    const testBus = buses[0];
    const testRoute = routes.find(r => testBus.assignedRoutes.includes(r.routeId));
    
    console.log(`Testing with Bus: ${testBus.busId} (${testBus.registrationNumber})`);
    console.log(`Route: ${testRoute.routeId} - ${testRoute.routeName}\n`);
    
    // Create GPS device and API client
    const gpsDevice = new GPSDevice(testBus, testRoute);
    const apiClient = new APIClient();
    
    // Generate location data
    const locationData = gpsDevice.generateLocationData();
    
    console.log('📍 Location Data Being Sent:');
    console.log('============================');
    console.log('Location Data Fields:');
    console.log(`  address: "${locationData.locationData.address}"`);
    console.log(`  city: "${locationData.locationData.city}"`);
    console.log(`  nearestLandmark: "${locationData.locationData.nearestLandmark}"`);
    console.log(`  roadName: "${locationData.locationData.roadName}"`);
    
    // Send to API
    console.log('\n🚀 Sending to API...');
    try {
        const result = await apiClient.sendLocationUpdate(locationData);
        console.log('📡 API Response:', result);
        
        if (result.success) {
            console.log('✅ Successfully sent to API');
            
            // Try to fetch back from API to see what was stored
            console.log('\n🔍 Fetching back from API to verify...');
            // Add a small delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const fetchResponse = await apiClient.makeRequest('GET', `/live-locations/${testBus.busId}`);
            console.log('📊 Fetched Data:', JSON.stringify(fetchResponse.data, null, 2));
            
        } else {
            console.log('❌ Failed to send to API:', result.error);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure your main API is running on http://localhost:3000');
        }
    }
}

testSendingLocationData();