/**
 * Single Bus Demo
 * Demonstrates GPS tracking for a single bus
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import GPSDevice from '../core/gps-device.js';
import APIClient from '../services/api-client.js';
import buses from '../config/buses.js';
import routes from '../config/routes.js';

dotenv.config();

async function singleBusDemo() {
  console.log(chalk.blue.bold('🚌 Single Bus GPS Demo\n'));
  
  try {
    // Select first bus and route for demo
    const bus = buses[0];
    const route = routes[0];
    
    console.log(chalk.yellow(`Selected Bus: ${bus.busId} (${bus.registrationNumber})`));
    console.log(chalk.yellow(`Route: ${route.routeName}`));
    console.log(chalk.yellow(`Distance: ${route.distance}km\n`));
    
    // Create GPS device
    const gpsDevice = new GPSDevice(bus, route);
    const apiClient = new APIClient();
    
    // Test API connection
    console.log(chalk.cyan('Testing API connection...'));
    const apiConnected = await apiClient.testConnection();
    
    if (!apiConnected) {
      console.log(chalk.yellow('⚠️  Running in offline mode\n'));
    }
    
    // Set up event listeners
    gpsDevice.on('locationUpdate', async (locationData) => {
      console.log(chalk.green('📍 Location Update:'));
      console.log(`   Coordinates: ${locationData.coordinates.latitude.toFixed(6)}, ${locationData.coordinates.longitude.toFixed(6)}`);
      console.log(`   Address: ${locationData.locationData.address}`);
      console.log(`   City: ${locationData.locationData.city}`);
      console.log(`   Road: ${locationData.locationData.roadName}`);
      console.log(`   Nearest Landmark: ${locationData.locationData.nearestLandmark}`);
      console.log(`   Speed: ${locationData.movement.speed.toFixed(1)} km/h`);
      console.log(`   Heading: ${locationData.movement.heading}°`);
      console.log(`   Battery: ${locationData.batteryLevel}%`);
      console.log(`   Signal: ${locationData.signalStrength}`);
      
      if (apiConnected) {
        const result = await apiClient.sendLocationUpdate(locationData);
        console.log(`   API Status: ${result.success ? '✅' : '❌'}`);
      }
      
      console.log();
    });
    
    gpsDevice.on('routeCompleted', () => {
      console.log(chalk.blue('🏁 Route completed! Starting new journey...\n'));
    });
    
    // Create mock trip
    const trip = {
      tripId: `DEMO_TRIP_${Date.now()}`,
      busId: bus.busId,
      routeId: route.routeId,
      startTime: new Date().toISOString(),
      status: 'in-transit'
    };
    
    // Start tracking
    console.log(chalk.green('🚀 Starting GPS tracking...\n'));
    gpsDevice.startTracking(trip);
    
    // Run for 5 minutes then stop
    setTimeout(() => {
      console.log(chalk.yellow('⏰ Demo time completed, stopping...\n'));
      gpsDevice.stopTracking();
      
      const status = gpsDevice.getStatus();
      console.log(chalk.blue('📊 Final Status:'));
      console.log(`   Battery Level: ${status.batteryLevel}%`);
      console.log(`   Signal Strength: ${status.signalStrength}`);
      console.log(`   Final Position: ${status.position.latitude.toFixed(6)}, ${status.position.longitude.toFixed(6)}`);
      
      process.exit(0);
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    console.error(chalk.red('❌ Demo failed:'), error.message);
    process.exit(1);
  }
}

singleBusDemo();