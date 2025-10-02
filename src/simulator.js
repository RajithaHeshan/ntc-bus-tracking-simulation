/**
 * Sri Lanka Bus GPS Data Simulator
 * Main application that coordinates multiple GPS devices to simulate bus tracking
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import cron from 'node-cron';

import GPSDevice from './core/gps-device.js';
import APIClient from './services/api-client.js';
import buses from './config/buses.js';
import routes from './config/routes.js';

// Load environment variables
dotenv.config();

// Debug: Check if API key is loaded
console.log('🔑 Debug - API_KEY loaded:', process.env.API_KEY ? process.env.API_KEY.substring(0, 20) + '...' : 'undefined');

class BusGPSSimulator {
  constructor() {
    this.devices = new Map();
    this.apiClient = new APIClient();
    this.isRunning = false;
    this.autoRestart = true; // ✅ ADD AUTO RESTART FEATURE
    this.completedRoutes = new Set(); // ✅ TRACK COMPLETED ROUTES
    this.randomEmissionInterval = null; // ✅ SINGLE RANDOM EMISSION TIMER
    this.statistics = {
      totalDevices: 0,
      activeDevices: 0,
      locationUpdatesSent: 0,
      apiFailures: 0,
      cyclesCompleted: 0, // ✅ TRACK SIMULATION CYCLES
      startTime: null
    };
    
    console.log(chalk.blue.bold('🚍 Sri Lanka Bus GPS Data Simulator'));
    console.log(chalk.gray('IoT Device Simulation for Real-time Bus Tracking'));
    console.log(chalk.gray('🔄 Fast mode: One bus every 10 seconds\n'));
  }
  
  /**
   * Initialize all GPS devices for buses
   */
  async initialize() {
    console.log(chalk.yellow('🔧 Initializing GPS devices...'));
    
    try {
      // Test API connection first
      const apiConnected = await this.apiClient.testConnection();
      if (!apiConnected) {
        console.log(chalk.yellow('⚠️  API connection failed, continuing in offline mode'));
      }
      
      // Create GPS devices for each active bus
      const activeBuses = buses.filter(bus => bus.status === 'active');
      
      for (const bus of activeBuses) {
        // Assign a route to the bus (using first assigned route)
        const routeId = bus.assignedRoutes[0];
        const route = routes.find(r => r.routeId === routeId);
        
        if (route) {
          try {
            const device = new GPSDevice(bus, route);
            this.setupDeviceEventListeners(device);
            this.devices.set(bus.busId, device);
            console.log(`✅ Created GPS device for ${bus.busId} on route ${route.routeId}`);
          } catch (error) {
            console.error(chalk.red(`❌ Failed to create GPS device for ${bus.busId}:`, error.message));
          }
        } else {
          console.error(chalk.red(`❌ No route found for bus ${bus.busId} with routeId: ${routeId}`));
          console.log(`Available routes:`, routes.map(r => r.routeId));
        }
      }
      
      this.statistics.totalDevices = this.devices.size;
      console.log(chalk.green(`✅ Initialized ${this.devices.size} GPS devices`));
      
      this.displayFleetSummary();
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize simulator:'), error.message);
      throw error;
    }
  }
  
  /**
   * Start GPS tracking simulation for all devices
   */
  async startSimulation() {
    if (this.isRunning) {
      console.log(chalk.yellow('⚠️  Simulation is already running'));
      return;
    }

    console.log(chalk.green.bold('\n🚀 Starting GPS simulation...\n'));

    this.isRunning = true;
    this.statistics.startTime = new Date();

    // Initialize all devices but DON'T start their individual intervals
    for (const [busId, device] of this.devices) {
      try {
        // Create a mock trip for the device
        const trip = this.generateMockTrip(busId, device.currentRoute.routeId);
        device.initializeTrip(trip); // Initialize but don't start automatic tracking
        this.statistics.activeDevices++;
      } catch (error) {
        console.error(chalk.red(`❌ Failed to initialize trip for bus ${busId}:`), error.message);
      }
    }

    console.log(chalk.green(`✅ Initialized ${this.statistics.activeDevices} buses for random emission`));

    // Start random emission (one bus per minute)
    this.startRandomEmission();

    // Set up periodic status reports
    this.setupStatusReporting();

    // Set up graceful shutdown
    this.setupShutdownHandlers();
  }  /**
   * Stop GPS tracking simulation
   */
  async stopSimulation() {
    if (!this.isRunning) {
      console.log(chalk.yellow('⚠️  Simulation is not running'));
      return;
    }
    
    console.log(chalk.yellow('\n🛑 Stopping GPS simulation...\n'));
    
    this.isRunning = false;
    
    // Stop random emission scheduler
    this.stopRandomEmission();
    
    // Stop all devices
    for (const [busId, device] of this.devices) {
      try {
        device.stopTracking();
      } catch (error) {
        console.error(chalk.red(`❌ Error stopping device ${busId}:`), error.message);
      }
    }
    
    this.statistics.activeDevices = 0;
    console.log(chalk.green('✅ GPS simulation stopped'));
    
    this.displayFinalStatistics();
  }
  
  /**
   * Restart the entire simulation cycle
   */
  async restartSimulationCycle() {
    try {
      console.log(chalk.yellow('🔄 Restarting simulation cycle...'));
      
      // Clear completed routes tracking
      this.completedRoutes.clear();
      this.statistics.cyclesCompleted++;
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Restart all devices
      for (const [busId, device] of this.devices) {
        if (device.isActive && this.isRunning) {
          const newTrip = this.generateMockTrip(busId, device.currentRoute.routeId);
          device.startTracking(newTrip);
        }
      }
      
      console.log(chalk.green.bold(`✅ Simulation cycle ${this.statistics.cyclesCompleted} started with all ${this.statistics.activeDevices} buses\n`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error restarting simulation cycle:'), error.message);
    }
  }
  
  /**
   * Setup event listeners for GPS devices
   */
  setupDeviceEventListeners(device) {
    // Location update event
    device.on('locationUpdate', async (locationData) => {
      await this.handleLocationUpdate(locationData);
    });
    
    // Tracking started event
    device.on('trackingStarted', (data) => {
      console.log(chalk.green(`🟢 Started tracking: Bus ${data.busId} (${data.deviceId})`));
    });
    
    // Tracking stopped event  
    device.on('trackingStopped', (data) => {
      console.log(chalk.red(`🔴 Stopped tracking: Bus ${data.busId} (${data.deviceId})`));
    });
    
    // Route completed event
    device.on('routeCompleted', async (completionData) => {
      console.log(chalk.blue(`🏁 Route completed: Bus ${completionData.busId} on ${completionData.routeId}`));
      
      // Send completion data to API
      await this.handleRouteCompletion(completionData);
      
      // ✅ ADD AUTO-RESTART LOGIC
      if (this.autoRestart && this.isRunning) {
        this.completedRoutes.add(completionData.busId);
        
        // Check if all buses have completed their routes
        if (this.completedRoutes.size >= this.statistics.activeDevices) {
          console.log(chalk.yellow.bold('\n🔄 All buses completed routes. Restarting simulation cycle...\n'));
          await this.restartSimulationCycle();
        } else {
          // Restart individual bus immediately
          setTimeout(async () => {
            const bus = this.devices.get(completionData.busId);
            if (bus && this.isRunning) {
              const newTrip = this.generateMockTrip(completionData.busId, completionData.routeId);
              bus.startTracking(newTrip);
              console.log(chalk.green(`🔄 Restarted: Bus ${data.busId} on ${data.routeId}`));
            }
          }, 2000); // 2 second delay before restart
        }
      }
    });
    
    // Device error event
    device.on('deviceError', (data) => {
      console.error(chalk.red(`⚠️  Device error: ${data.deviceId} - ${data.error}`));
    });
    
    // Device shutdown event
    device.on('deviceShutdown', (data) => {
      console.log(chalk.yellow(`🔋 Device shutdown: ${data.deviceId} (${data.reason})`));
      this.statistics.activeDevices--;
    });
  }
  
  /**
   * Emit data from one random bus
   */
  emitRandomBusData() {
    if (!this.isRunning || this.devices.size === 0) {
      return;
    }

    // Get all active devices
    const activeDevices = Array.from(this.devices.values()).filter(device => device.isActive);
    
    if (activeDevices.length === 0) {
      console.log(chalk.yellow('⚠️  No active devices available for emission'));
      return;
    }

    // Randomly select one device
    const randomIndex = Math.floor(Math.random() * activeDevices.length);
    const selectedDevice = activeDevices[randomIndex];

    try {
      // Update position and generate location data for the selected device
      selectedDevice.updatePositionOnce(); // We'll create this method
      console.log(chalk.cyan(`📡 Random emission: Bus ${selectedDevice.busId} (${activeDevices.length} active buses)`));
    } catch (error) {
      console.error(chalk.red(`❌ Error in random emission for bus ${selectedDevice.busId}:`), error.message);
    }
  }

  /**
   * Start random emission scheduler (one bus per minute)
   */
  startRandomEmission() {
    if (this.randomEmissionInterval) {
      clearInterval(this.randomEmissionInterval);
    }

    // Emit data from one random bus every 10 seconds (faster for testing)
    this.randomEmissionInterval = setInterval(() => {
      this.emitRandomBusData();
    }, 10000); // 10 seconds for faster route completions

    console.log(chalk.green('🎲 Started random emission: One bus every 10 seconds (fast mode)'));
    
    // Emit first data immediately
    setTimeout(() => {
      this.emitRandomBusData();
    }, 2000); // First emission after 2 seconds
  }

  /**
   * Stop random emission scheduler
   */
  stopRandomEmission() {
    if (this.randomEmissionInterval) {
      clearInterval(this.randomEmissionInterval);
      this.randomEmissionInterval = null;
      console.log(chalk.yellow('🛑 Stopped random emission scheduler'));
    }
  }

  /**
   * Handle location updates from GPS devices
   */
  async handleLocationUpdate(locationData) {
    try {
      // Send to API if connected
      const result = await this.apiClient.sendLocationUpdate(locationData);
      
      if (result.success) {
        this.statistics.locationUpdatesSent++;
        
        // Display location update (throttled output)
        if (this.statistics.locationUpdatesSent % 10 === 0) {
          this.displayLocationUpdate(locationData);
        }
      } else {
        this.statistics.apiFailures++;
        console.error(chalk.red(`❌ API Error for bus ${locationData.busId}: ${result.error}`));
      }
      
    } catch (error) {
      this.statistics.apiFailures++;
      console.error(chalk.red('❌ Error handling location update:'), error.message);
    }
  }
  
  /**
   * Handle route completion from GPS devices
   */
  async handleRouteCompletion(completionData) {
    try {
      // Send completion data to API
      const result = await this.apiClient.sendRouteCompletion(completionData);
      
      if (result.success) {
        this.statistics.completedRoutes = (this.statistics.completedRoutes || 0) + 1;
        console.log(chalk.green(`✅ Route completion sent for bus ${completionData.busId}`));
        console.log(chalk.blue(`🏁 Journey Summary: ${completionData.totalJourneyDuration}min, ${completionData.journeySummary.totalDistance}km, ${completionData.journeySummary.averageSpeed}km/h`));
      } else {
        console.error(chalk.red(`❌ Failed to send route completion for bus ${completionData.busId}: ${result.error}`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error handling route completion:'), error.message);
    }
  }
  
  /**
   * Display location update information
   */
  displayLocationUpdate(locationData) {
    const bus = locationData.busId;
    const coords = `${locationData.coordinates.latitude.toFixed(4)}, ${locationData.coordinates.longitude.toFixed(4)}`;
    const speed = `${locationData.movement.speed.toFixed(1)} km/h`;
    const battery = `${locationData.batteryLevel}%`;
    const location = `${locationData.locationData.city} (${locationData.locationData.nearestLandmark})`;
    
    console.log(chalk.cyan(
      `📍 ${bus}: ${coords} | ${location} | ${speed} | Battery: ${battery}`
    ));
  }
  
  /**
   * Display fleet summary
   */
  displayFleetSummary() {
    console.log(chalk.blue.bold('\n📊 Fleet Summary:'));
    
    const operatorCounts = {};
    const routeCounts = {};
    
    for (const [busId, device] of this.devices) {
      const operator = device.bus.operatorName;
      const route = device.currentRoute.routeId;
      
      operatorCounts[operator] = (operatorCounts[operator] || 0) + 1;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    }
    
    console.log(chalk.white('Operators:'));
    Object.entries(operatorCounts).forEach(([operator, count]) => {
      console.log(chalk.gray(`  • ${operator}: ${count} buses`));
    });
    
    console.log(chalk.white('\nRoutes:'));
    Object.entries(routeCounts).forEach(([routeId, count]) => {
      const route = routes.find(r => r.routeId === routeId);
      console.log(chalk.gray(`  • ${routeId}: ${route?.routeName} (${count} buses)`));
    });
    
    console.log();
  }
  
  /**
   * Generate mock trip data
   */
  generateMockTrip(busId, routeId) {
    const now = new Date();
    return {
      tripId: `TRIP_${busId}_${now.getTime()}`,
      busId,
      routeId,
      startTime: now.toISOString(),
      status: 'in-transit',
      scheduledDepartureTime: now.toISOString(),
      estimatedArrivalTime: new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString() // 3 hours later
    };
  }
  
  /**
   * Setup periodic status reporting
   */
  setupStatusReporting() {
    // Every 5 minutes, display status
    cron.schedule('*/5 * * * *', () => {
      if (this.isRunning) {
        this.displayStatus();
      }
    });
    
    // Every hour, display detailed statistics
    cron.schedule('0 * * * *', () => {
      if (this.isRunning) {
        this.displayDetailedStatistics();
      }
    });
  }
  
  /**
   * Display current simulation status
   */
  displayStatus() {
    const uptime = this.statistics.startTime 
      ? Math.floor((Date.now() - this.statistics.startTime.getTime()) / 1000)
      : 0;
    
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    console.log(chalk.blue.bold('\n📊 Simulation Status:'));
    console.log(chalk.white(`  • Active Devices: ${this.statistics.activeDevices}/${this.statistics.totalDevices}`));
    console.log(chalk.white(`  • Simulation Cycles: ${this.statistics.cyclesCompleted}`)); // ✅ SHOW CYCLES
    console.log(chalk.white(`  • Location Updates: ${this.statistics.locationUpdatesSent}`));
    console.log(chalk.white(`  • API Failures: ${this.statistics.apiFailures}`));
    console.log(chalk.white(`  • Auto-Restart: ${this.autoRestart ? 'Enabled' : 'Disabled'}`)); // ✅ SHOW AUTO-RESTART STATUS
    console.log(chalk.white(`  • Uptime: ${hours}h ${minutes}m`));
    console.log();
  }
  
  /**
   * Display detailed statistics
   */
  displayDetailedStatistics() {
    console.log(chalk.blue.bold('\n📈 Detailed Statistics:'));
    
    const deviceStats = [];
    for (const [busId, device] of this.devices) {
      const status = device.getStatus();
      deviceStats.push({
        busId,
        battery: status.batteryLevel,
        signal: status.signalStrength,
        active: status.isActive,
        route: status.currentRoute
      });
    }
    
    // Group by status
    const activeDevices = deviceStats.filter(d => d.active);
    const inactiveDevices = deviceStats.filter(d => !d.active);
    
    console.log(chalk.green(`  ✅ Active: ${activeDevices.length}`));
    console.log(chalk.red(`  ❌ Inactive: ${inactiveDevices.length}`));
    
    // Battery statistics
    const avgBattery = deviceStats.reduce((sum, d) => sum + d.battery, 0) / deviceStats.length;
    console.log(chalk.yellow(`  🔋 Average Battery: ${avgBattery.toFixed(1)}%`));
    
    // Signal strength distribution
    const signalCounts = {};
    deviceStats.forEach(d => {
      signalCounts[d.signal] = (signalCounts[d.signal] || 0) + 1;
    });
    
    console.log(chalk.cyan('  📶 Signal Distribution:'));
    Object.entries(signalCounts).forEach(([signal, count]) => {
      console.log(chalk.gray(`    • ${signal}: ${count} devices`));
    });
    
    console.log();
  }
  
  /**
   * Display final statistics
   */
  displayFinalStatistics() {
    const runtime = this.statistics.startTime 
      ? Math.floor((Date.now() - this.statistics.startTime.getTime()) / 1000)
      : 0;
    
    console.log(chalk.blue.bold('\n📊 Final Statistics:'));
    console.log(chalk.white(`  • Total Runtime: ${runtime} seconds`));
    console.log(chalk.white(`  • Simulation Cycles: ${this.statistics.cyclesCompleted}`)); // ✅ SHOW CYCLES
    console.log(chalk.white(`  • Location Updates Sent: ${this.statistics.locationUpdatesSent}`));
    console.log(chalk.white(`  • API Failures: ${this.statistics.apiFailures}`));
    console.log(chalk.white(`  • Success Rate: ${((this.statistics.locationUpdatesSent / (this.statistics.locationUpdatesSent + this.statistics.apiFailures)) * 100).toFixed(1)}%`));
    console.log(chalk.white(`  • Average Updates per Cycle: ${this.statistics.cyclesCompleted > 0 ? (this.statistics.locationUpdatesSent / this.statistics.cyclesCompleted).toFixed(1) : 'N/A'}`)); // ✅ SHOW AVERAGE
    console.log();
  }
  
  /**
   * Setup graceful shutdown handlers
   */
  setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log(chalk.yellow(`\n🛑 Received ${signal}, shutting down gracefully...`));
      await this.stopSimulation();
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
  
  /**
   * Get simulator statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }
  
  /**
   * Enable or disable auto-restart
   */
  setAutoRestart(enabled) {
    this.autoRestart = enabled;
    console.log(chalk.yellow(`🔄 Auto-restart ${enabled ? 'enabled' : 'disabled'}`));
  }
  
  /**
   * Get current auto-restart status
   */
  getAutoRestartStatus() {
    return this.autoRestart;
  }
}

// Main execution
async function main() {
  try {
    const simulator = new BusGPSSimulator();
    
    console.log(chalk.green('🔧 Initializing simulator...'));
    await simulator.initialize();
    
    console.log(chalk.green('🚀 Starting simulation...'));
    await simulator.startSimulation();
    
    // Keep the process running
    console.log(chalk.blue('✅ Simulation running. Press Ctrl+C to stop.\n'));
    
    // Keep the process alive by setting up a persistent interval
    const keepAlive = setInterval(() => {
      // This interval keeps the Node.js event loop active
      // The actual work is done by the GPS devices' intervals
    }, 60000); // Check every minute
    
    // Clean up on exit
    process.on('SIGINT', () => {
      clearInterval(keepAlive);
    });
    process.on('SIGTERM', () => {
      clearInterval(keepAlive);
    });
    
  } catch (error) {
    console.error(chalk.red.bold('💥 Fatal error:'), error.message);
    console.error(chalk.red('Error details:'), error.stack);
    process.exit(1);
  }
}

// Export for testing/external use
export { BusGPSSimulator };

// Run the main function
main();