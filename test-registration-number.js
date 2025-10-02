/**
 * Test registrationNumber being sent and stored
 */

import { APIClient } from './src/services/api-client.js';
import { GPSDevice } from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import { routes } from './src/config/routes.js';

async function testRegistrationNumber() {
    console.log('🧪 Testing registrationNumber in location data...\n');
    
    // Get first bus and route
    const testBus = buses[0];
    const testRoute = routes.find(r => testBus.assignedRoutes.includes(r.routeId));
    
    console.log(`📋 Bus Configuration:`);
    console.log(`   busId: ${testBus.busId}`);
    console.log(`   registrationNumber: "${testBus.registrationNumber}"`);
    console.log(`   Route: ${testRoute.routeId} - ${testRoute.routeName}\n`);
    
    // Create GPS device
    const gpsDevice = new GPSDevice(testBus, testRoute);
    const locationData = gpsDevice.generateLocationData();
    
    console.log('📍 Generated Location Data:');
    console.log('===========================');
    console.log(`busId: "${locationData.busId}"`);
    console.log(`registrationNumber: "${locationData.registrationNumber}"`);
    console.log(`routeId: "${locationData.routeId}"`);
    console.log(`routeName: "${locationData.routeName}"`);
    
    // Check if registrationNumber is present
    if (!locationData.registrationNumber) {
        console.log('❌ registrationNumber is MISSING from GPS device data!');
        return;
    } else {
        console.log('✅ registrationNumber is present in GPS device data');
    }
    
    console.log('\n📤 Sending to Main API...');
    
    try {
        const apiClient = new APIClient();
        const result = await apiClient.sendLocationUpdate(locationData);
        
        console.log('📡 API Response Status:', result.success ? 'SUCCESS' : 'FAILED');
        
        if (result.success) {
            console.log('📊 Returned Data from API:');
            console.log('===========================');
            const returnedData = result.data?.data;
            console.log(`busId: "${returnedData?.busId || 'MISSING'}"`);
            console.log(`registrationNumber: "${returnedData?.registrationNumber || 'MISSING'}"`);
            console.log(`locationId: "${returnedData?.locationId || 'MISSING'}"`);
            
            if (!returnedData?.registrationNumber) {
                console.log('\n❌ ISSUE FOUND: registrationNumber is MISSING from API response!');
                console.log('   This means the main API is not returning the registrationNumber field.');
            } else {
                console.log('\n✅ registrationNumber is present in API response');
            }
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testRegistrationNumber();