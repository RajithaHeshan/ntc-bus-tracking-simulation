/**
 * Fetch ALL buses with higher limit
 */

import axios from 'axios';

async function fetchAllBusesWithLimit() {
    try {
        console.log('🔍 Fetching ALL buses from main API with higher limit...\n');
        
        const response = await axios.get('http://localhost:3000/api/buses?limit=100', {
            timeout: 10000
        });
        
        if (response.data.success && response.data.data) {
            const buses = response.data.data;
            console.log(`📊 Found ${buses.length} buses in main API:\n`);
            
            buses.forEach((bus, index) => {
                console.log(`${String(index + 1).padStart(2, ' ')}. Bus ID: ${bus.busId.padEnd(6)} | Registration: ${bus.registrationNumber.padEnd(12)} | Operator: ${bus.operatorId || 'N/A'}`);
            });
            
            console.log(`\n✅ TOTAL: ${buses.length} buses found`);
            console.log(`${buses.length >= 25 ? '✅' : '❌'} Meets 25+ requirement: ${buses.length >= 25 ? 'YES' : 'NO'}`);
            
            console.log('\n🔧 Bus IDs for GPS Simulator:');
            const busIds = buses.map(bus => bus.busId).sort();
            console.log(busIds.join(', '));
            
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

fetchAllBusesWithLimit();