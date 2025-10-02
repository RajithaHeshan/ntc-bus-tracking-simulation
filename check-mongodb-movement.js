/**
 * Check MongoDB movement data to see if realistic values are being stored
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function checkMovementData() {
  try {
    console.log('🔍 Checking movement data in MongoDB...\n');
    
    // Get all live locations
    const response = await axios.get('http://localhost:3000/api/live-location');
    
    if (response.data && response.data.locations) {
      const locations = response.data.locations;
      console.log(`📊 Found ${locations.length} location entries\n`);
      
      // Show the first few entries to check movement data
      for (let i = 0; i < Math.min(5, locations.length); i++) {
        const location = locations[i];
        console.log(`🚍 Bus ${location.busId} (${location.registrationNumber}):`);
        console.log(`   📍 Coordinates: ${location.coordinates.latitude}, ${location.coordinates.longitude}`);
        console.log(`   🏃 Movement:`);
        console.log(`      Speed: ${location.movement.speed} km/h`);
        console.log(`      Heading: ${location.movement.heading}°`);
        console.log(`      Is Moving: ${location.movement.isMoving}`);
        console.log(`   📍 Location: ${location.locationData.city}, ${location.locationData.nearestLandmark}`);
        console.log(`   🔋 Battery: ${location.batteryLevel}%`);
        console.log(`   ⏰ Last Updated: ${location.lastUpdated}\n`);
      }
      
      // Check for movement statistics
      const movingBuses = locations.filter(loc => loc.movement.isMoving);
      const avgSpeed = locations.reduce((sum, loc) => sum + loc.movement.speed, 0) / locations.length;
      
      console.log(`📈 Movement Statistics:`);
      console.log(`   Moving buses: ${movingBuses.length}/${locations.length}`);
      console.log(`   Average speed: ${avgSpeed.toFixed(1)} km/h`);
      console.log(`   Speed range: ${Math.min(...locations.map(l => l.movement.speed))} - ${Math.max(...locations.map(l => l.movement.speed))} km/h`);
      
    } else {
      console.log('❌ No location data found');
    }
    
  } catch (error) {
    console.error('❌ Error checking movement data:', error.message);
  }
}

checkMovementData();