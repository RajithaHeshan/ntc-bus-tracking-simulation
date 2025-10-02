/**
 * Test Location Data Generation
 * Debug why location fields are empty in MongoDB
 */

import { findNearestLandmark, generateAddress, generateCity, generateRoadName } from './src/utils/location-data.js';

function testLocationGeneration() {
    console.log('🧪 Testing Location Data Generation...\n');
    
    // Test coordinates (Colombo area)
    const testCoords = [
        { lat: 6.9271, lng: 79.8612, name: "Galle Face Green area" },
        { lat: 7.2906, lng: 80.6337, name: "Kandy area" },
        { lat: 6.0535, lng: 80.2210, name: "Galle area" }
    ];
    
    testCoords.forEach((coord, index) => {
        console.log(`📍 Test ${index + 1}: ${coord.name}`);
        console.log(`Coordinates: ${coord.lat}, ${coord.lng}`);
        
        try {
            const landmark = findNearestLandmark(coord.lat, coord.lng);
            const address = generateAddress(coord.lat, coord.lng, "Colombo - Kandy Express");
            const city = generateCity(coord.lat, coord.lng);
            const roadName = generateRoadName(coord.lat, coord.lng, "Colombo - Kandy Express");
            
            console.log(`✅ Nearest Landmark: "${landmark?.name || 'null'}"`);
            console.log(`✅ Address: "${address || 'null'}"`);
            console.log(`✅ City: "${city || 'null'}"`);
            console.log(`✅ Road Name: "${roadName || 'null'}"`);
            
            // Check if any are empty
            if (!landmark || !address || !city || !roadName) {
                console.log('❌ Some location data is missing!');
            } else {
                console.log('✅ All location data generated successfully!');
            }
            
        } catch (error) {
            console.log(`❌ Error generating location data: ${error.message}`);
        }
        
        console.log('-------------------\n');
    });
}

testLocationGeneration();