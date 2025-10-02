/**
 * Detailed test of registrationNumber save/retrieve
 */

import { APIClient } from './src/services/api-client.js';
import { GPSDevice } from './src/core/gps-device.js';
import { buses } from './src/config/buses.js';
import { routes } from './src/config/routes.js';

async function detailedRegistrationNumberTest() {
    console.log('🔍 DETAILED registrationNumber Test\n');
    
    const testBus = buses[0];
    const testRoute = routes.find(r => testBus.assignedRoutes.includes(r.routeId));
    
    console.log('📋 Step 1: Bus Configuration');
    console.log(`   busId: ${testBus.busId}`);
    console.log(`   registrationNumber: "${testBus.registrationNumber}"`);
    
    console.log('\n📡 Step 2: GPS Device Generation');
    const gpsDevice = new GPSDevice(testBus, testRoute);
    const locationData = gpsDevice.generateLocationData();
    
    console.log(`   Generated registrationNumber: "${locationData.registrationNumber}"`);
    
    console.log('\n📤 Step 3: Full Location Data Being Sent');
    console.log('==========================================');
    console.log(JSON.stringify({
        busId: locationData.busId,
        registrationNumber: locationData.registrationNumber,
        routeId: locationData.routeId,
        routeName: locationData.routeName,
        coordinates: locationData.coordinates,
        locationData: locationData.locationData
    }, null, 2));
    
    console.log('\n🚀 Step 4: Sending to API...');
    
    try {
        const apiClient = new APIClient();
        const result = await apiClient.sendLocationUpdate(locationData);
        
        console.log('📊 Step 5: Full API Response');
        console.log('============================');
        console.log('Response success:', result.success);
        console.log('Full response data:');
        console.log(JSON.stringify(result.data, null, 2));
        
        if (result.data?.data) {
            const returnedData = result.data.data;
            console.log('\n🎯 Step 6: Key Fields Analysis');
            console.log('==============================');
            console.log(`locationId: ${returnedData.locationId ? '✅ Present' : '❌ Missing'}`);
            console.log(`busId: ${returnedData.busId ? '✅ Present' : '❌ Missing'} (${returnedData.busId})`);
            console.log(`registrationNumber: ${returnedData.registrationNumber ? '✅ Present' : '❌ Missing'} (${returnedData.registrationNumber || 'undefined'})`);
            console.log(`coordinates: ${returnedData.coordinates ? '✅ Present' : '❌ Missing'}`);
            console.log(`movement: ${returnedData.movement ? '✅ Present' : '❌ Missing'}`);
            
            if (!returnedData.registrationNumber) {
                console.log('\n🚨 DIAGNOSIS: registrationNumber is being sent but not returned from API!');
                console.log('   This indicates the MongoDB save or retrieve operation has an issue.');
            } else {
                console.log('\n✅ SUCCESS: registrationNumber is working correctly!');
            }
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

detailedRegistrationNumberTest();