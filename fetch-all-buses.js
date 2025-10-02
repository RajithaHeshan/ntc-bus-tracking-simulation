/**
 * Fetch all buses from main API
 */

import axios from 'axios';

async function fetchAllBuses() {
    try {
        console.log('🔍 Fetching all buses from main API...\n');
        
        const response = await axios.get('http://localhost:3000/api/buses', {
            timeout: 10000
        });
        
        if (response.data.success && response.data.data) {
            const buses = response.data.data;
            console.log(`📊 Found ${buses.length} buses in main API:\n`);
            
            buses.forEach((bus, index) => {
                console.log(`${index + 1}. Bus ID: ${bus.busId} | Registration: ${bus.registrationNumber} | Operator: ${bus.operatorId || 'N/A'}`);
            });
            
            console.log('\n🔧 Available Bus IDs for GPS Simulator:');
            const busIds = buses.map(bus => bus.busId).sort();
            console.log(busIds.join(', '));
            
            console.log('\n📋 Registration Numbers:');
            buses.forEach(bus => {
                console.log(`${bus.busId}: ${bus.registrationNumber}`);
            });
            
        } else {
            console.log('❌ No bus data found in API response');
        }
        
    } catch (error) {
        console.log('❌ Error fetching buses:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure your main API is running on http://localhost:3000');
        }
    }
}

fetchAllBuses();