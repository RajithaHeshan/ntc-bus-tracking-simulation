/**
 * GPS Device Simulator
 * Simulates individual GPS devices attached to buses
 */

import { EventEmitter } from 'events';
import { generateLocationId } from '../utils/coordinates.js';
import { findNearestLandmark, generateAddress, generateCity, generateRoadName } from '../utils/location-data.js';

export class GPSDevice extends EventEmitter {
  constructor(bus, route) {
    super();
    
    this.deviceId = bus.gpsDeviceId;
    this.busId = bus.busId;
    this.bus = bus;
    this.currentRoute = route;
    this.isActive = true;
    this.batteryLevel = 100;
    
    // Validate route data
    if (!route || !route.routeId) {
      console.error(`❌ Invalid route for bus ${bus.busId}:`, route);
      throw new Error(`Invalid route provided for bus ${bus.busId}`);
    }
    
    // Device status
    this.signalStrength = 'good';
    this.lastUpdate = new Date();
    this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 30000; // 30 seconds
    
    // Movement state
    this.currentPosition = {
      latitude: route.startLocation.coordinates.latitude,
      longitude: route.startLocation.coordinates.longitude,
      accuracy: this.generateAccuracy(),
      altitude: Math.random() * 100 + 50 // 50-150m altitude
    };
    
    this.movement = {
      speed: 0,
      heading: Math.floor(Math.random() * 360), // Random initial heading (0-359 degrees)
      isMoving: false,
      nextWaypointIndex: 0
    };
    
    // Waypoint progression tracking
    this.stepsAtCurrentWaypoint = 0;
    
    // Trip information
    this.currentTrip = null;
    this.tripStartTime = null;
    this.actualTripStartTime = null; // Set when first location update is sent
    
    console.log(`📡 GPS Device ${this.deviceId} initialized for bus ${this.busId} on route ${route.routeId}`);
  }
  
  /**
   * Initialize trip without starting automatic tracking
   */
  initializeTrip(trip = null) {
    if (!this.isActive) {
      console.log(`⚠️  Device ${this.deviceId} is inactive`);
      return;
    }

    this.currentTrip = trip;
    this.tripStartTime = new Date();

    console.log(`📡 GPS Device ${this.deviceId} initialized for bus ${this.busId} on route ${this.currentRoute.routeId}`);
  }

  /**
   * Update position once and emit location data (for random emission)
   */
  updatePositionOnce() {
    if (!this.isActive || !this.currentTrip) {
      return;
    }

    try {
      // Reset trip start time when bus starts a new emission cycle (more realistic)
      if (!this.actualTripStartTime || this.movement.nextWaypointIndex === 0) {
        this.actualTripStartTime = new Date();
        console.log(`🚀 Bus ${this.busId} starting new trip segment at ${this.actualTripStartTime.toLocaleTimeString()}`);
      }

      // Update position logic (same as updatePosition but without the emit)
      this.updatePositionInternal();
      
      // Create and emit location data
      const locationData = this.generateLocationData();
      this.emit('locationUpdate', locationData);
      this.lastUpdate = new Date();

    } catch (error) {
      console.error(`❌ Error in single position update for device ${this.deviceId}:`, error.message);
    }
  }

  /**
   * Internal position update logic (extracted from updatePosition)
   */
  updatePositionInternal() {
    if (!this.currentRoute || !this.isActive) return;

    // Simulate movement along route waypoints
    const waypoints = [
      this.currentRoute.startLocation.coordinates,
      ...this.currentRoute.waypoints.map(wp => wp.coordinates),
      this.currentRoute.endLocation.coordinates
    ];
    
    // Build waypoint names list for better logging
    const waypointNames = [
      this.currentRoute.startLocation.name,
      ...this.currentRoute.waypoints.map(wp => wp.name),
      this.currentRoute.endLocation.name
    ];
    
    if (this.movement.nextWaypointIndex >= waypoints.length) {
      // Route completed - trigger completion process
      console.log(`🏁 Bus ${this.busId} completed route ${this.currentRoute.routeId}!`);
      this.triggerRouteCompletion();
      
      // Reset for next trip
      this.movement.nextWaypointIndex = 0;
      this.stepsAtCurrentWaypoint = 0; // Reset step counter
      this.actualTripStartTime = null; // Reset for new trip
      this.currentPosition = { 
        ...this.currentRoute.startLocation.coordinates,
        accuracy: 5 + Math.random() * 10,
        altitude: Math.floor(Math.random() * 100 + 50)
      };
      console.log(`🔄 Bus ${this.busId} restarting from ${this.currentRoute.startLocation.name}`);
      return;
    }
    
    // Force waypoint progression every emission for demo purposes
    const currentWaypointName = waypointNames[this.movement.nextWaypointIndex] || 'Unknown';
    console.log(`🚍 Bus ${this.busId}: Progressing through waypoint ${this.movement.nextWaypointIndex + 1}/${waypoints.length} (${currentWaypointName})`);
    
    // Advance waypoint - normal progression only
    this.movement.nextWaypointIndex++;
    console.log(`✅ Bus ${this.busId} advanced to waypoint ${this.movement.nextWaypointIndex}/${waypoints.length}`);
    
    // If we still have waypoints ahead, update position towards next target
    if (this.movement.nextWaypointIndex < waypoints.length) {
      const nextTarget = waypoints[this.movement.nextWaypointIndex];
      const nextWaypointName = waypointNames[this.movement.nextWaypointIndex] || 'Unknown';
      
      // Move position closer to next waypoint
      this.currentPosition.latitude = nextTarget.latitude + (Math.random() - 0.5) * 0.01; // Small variation
      this.currentPosition.longitude = nextTarget.longitude + (Math.random() - 0.5) * 0.01;
      
      this.movement.heading = this.calculateBearing(this.currentPosition, nextTarget);
      console.log(`🎯 Bus ${this.busId} now heading towards waypoint ${this.movement.nextWaypointIndex + 1}: ${nextWaypointName}`);
    }
    
    // Generate realistic speed variation
    this.updateSpeed();
    
    // Update battery and signal
    this.updateBattery();
    this.checkSignalStrength();
  }

  /**
   * Start GPS tracking simulation
   */
  startTracking(trip = null) {
    if (!this.isActive) {
      console.log(`⚠️  Device ${this.deviceId} is inactive`);
      return;
    }
    
    this.currentTrip = trip;
    this.tripStartTime = new Date();
    
    console.log(`🚀 Starting GPS tracking for device ${this.deviceId}`);
    
    // Initial position update
    this.updatePosition();
    
    // Set up regular updates
    this.trackingInterval = setInterval(() => {
      this.updatePosition();
      this.updateBattery();
      this.checkSignalStrength();
    }, this.updateInterval);
    
    this.emit('trackingStarted', {
      deviceId: this.deviceId,
      busId: this.busId,
      tripId: this.currentTrip?.tripId
    });
  }
  
  /**
   * Stop GPS tracking
   */
  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    this.movement.speed = 0;
    this.movement.isMoving = false;
    
    console.log(`🛑 Stopped GPS tracking for device ${this.deviceId}`);
    
    this.emit('trackingStopped', {
      deviceId: this.deviceId,
      busId: this.busId
    });
  }
  
  /**
   * Update GPS position along the route
   */
  updatePosition() {
    if (!this.currentRoute || !this.isActive) return;
    
    try {
      // Use the internal position update logic
      this.updatePositionInternal();
      
      // Create location data
      const locationData = this.generateLocationData();
      
      // Emit location update
      this.emit('locationUpdate', locationData);
      this.lastUpdate = new Date();
      
    } catch (error) {
      console.error(`❌ Error updating position for device ${this.deviceId}:`, error.message);
      this.emit('deviceError', {
        deviceId: this.deviceId,
        error: error.message
      });
    }
  }
  
  /**
   * Move GPS position towards target coordinates
   */
  moveTowards(target) {
    // Use much higher acceleration for guaranteed waypoint progression
    const baseSpeed = this.movement.speed; // km/h
    const acceleratedSpeed = Math.max(baseSpeed * 20, 200); // 20x speed or minimum 200 km/h for demo
    
    const timeInterval = this.updateInterval / 1000 / 3600; // hours
    const distanceKm = acceleratedSpeed * timeInterval;
    const distanceDegrees = distanceKm / 111; // Approximate km to degrees
    
    const bearing = this.calculateBearing(this.currentPosition, target);
    const bearingRad = bearing * (Math.PI / 180);
    
    // Update position with accelerated movement
    const deltaLat = distanceDegrees * Math.cos(bearingRad);
    const deltaLng = distanceDegrees * Math.sin(bearingRad);
    
    this.currentPosition.latitude += deltaLat;
    this.currentPosition.longitude += deltaLng;
    
    console.log(`🚛 Bus ${this.busId} moved ${distanceKm.toFixed(3)}km towards target at speed ${acceleratedSpeed}km/h`);
    
    // Add realistic GPS accuracy variation
    this.currentPosition.accuracy = this.generateAccuracy();
    this.movement.heading = bearing;
    this.movement.isMoving = baseSpeed > 5; // Moving if speed > 5 km/h
  }
  
  /**
   * Update bus speed with realistic variations
   */
  updateSpeed() {
    const route = this.currentRoute;
    let targetSpeed = route.averageSpeed;
    
    // Random speed variations
    const variation = (Math.random() - 0.5) * 20; // ±10 km/h variation
    targetSpeed += variation;
    
    // Respect speed limits
    targetSpeed = Math.min(targetSpeed, route.maxSpeed);
    targetSpeed = Math.max(targetSpeed, 0);
    
    // Simulate traffic and stops
    if (Math.random() < 0.1) { // 10% chance of stop/slow traffic
      targetSpeed *= Math.random() * 0.5; // Reduce speed by 0-50%
    }
    
    this.movement.speed = Math.max(0, targetSpeed);
  }

  /**
   * Update movement status (heading and isMoving)
   */
  updateMovementStatus() {
    // Generate realistic heading (0-360 degrees)
    if (this.movement.speed > 5) {
      // If moving, update heading based on route direction
      const route = this.currentRoute;
      if (route.waypoints && route.waypoints.length > 1) {
        const start = route.waypoints[0];
        const end = route.waypoints[1];
        this.movement.heading = this.calculateBearing(start.coordinates, end.coordinates);
      } else {
        // Random heading variation for realistic movement
        this.movement.heading = (this.movement.heading + (Math.random() - 0.5) * 30) % 360;
        if (this.movement.heading < 0) this.movement.heading += 360;
      }
    }
    
    // Update isMoving based on speed
    this.movement.isMoving = this.movement.speed > 5; // Moving if speed > 5 km/h
    
    // Ensure heading is an integer
    this.movement.heading = Math.round(this.movement.heading);
  }
  
  /**
   * Generate GPS location data packet
   */
  generateLocationData() {
    // ✅ Update movement data first to get realistic values
    this.updateSpeed();
    this.updateMovementStatus();
    
    const alerts = this.checkAlerts();
    const latitude = parseFloat(this.currentPosition.latitude.toFixed(6));
    const longitude = parseFloat(this.currentPosition.longitude.toFixed(6));
    
    // Generate realistic Sri Lankan location data
    const nearestLandmark = findNearestLandmark(latitude, longitude);
    const address = generateAddress(latitude, longitude, this.currentRoute.routeName);
    const city = generateCity(latitude, longitude);
    const roadName = generateRoadName(latitude, longitude, this.currentRoute.routeName);
    
    return {
      locationId: generateLocationId(this.busId),
      tripId: this.currentTrip?.tripId || `TRIP_${this.busId}_${Date.now()}`,
      busId: this.busId,
      routeId: this.currentRoute.routeId,
      routeName: this.currentRoute.routeName,
      startLocation: this.currentRoute.startLocation,
      endLocation: this.currentRoute.endLocation,
      registrationNumber: this.bus.registrationNumber, // ✅ ADD MISSING FIELD
      gpsDeviceId: this.deviceId,
      
      // GPS coordinates
      coordinates: {
        latitude: latitude,
        longitude: longitude,
        accuracy: this.currentPosition.accuracy,
        altitude: this.currentPosition.altitude
      },
      
      // Movement data  
      movement: {
        speed: parseFloat(this.movement.speed.toFixed(1)),
        heading: parseInt(this.movement.heading),
        isMoving: this.movement.isMoving
      },

      // Waypoint tracking information
      waypointInfo: this.generateWaypointInfo(),
      
      // Distance and Duration tracking information
      ...this.generateDistanceAndDurationInfo(),
      
      // Location data (NEW - realistic Sri Lankan context)
      locationData: {
        address: address,
        city: city,
        nearestLandmark: nearestLandmark ? nearestLandmark.name : '',
        roadName: roadName
      },
      
      // Device status (flattened to match API schema)
      signalStrength: this.signalStrength,
      batteryLevel: this.batteryLevel,
      timestamp: new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      isValid: true,
      
      // Alerts (matching API schema)
      alerts: {
        speedingAlert: alerts.speedingAlert,
        routeDeviationAlert: alerts.routeDeviationAlert || false,
        emergencyAlert: alerts.emergencyAlert || false,
        maintenanceAlert: false
      }
    };
  }
  
  /**
   * Generate waypoint information for current position
   */
  generateWaypointInfo() {
    if (!this.currentRoute || !this.currentRoute.waypoints) {
      return {
        currentWaypoint: null,
        nextWaypoint: null,
        routeProgress: {
          completedWaypoints: 0,
          totalWaypoints: 0,
          progressPercentage: 0
        }
      };
    }

    // Build complete waypoint list including start and end locations
    const waypoints = [
      { name: this.currentRoute.startLocation.name, coordinates: this.currentRoute.startLocation.coordinates },
      ...this.currentRoute.waypoints,
      { name: this.currentRoute.endLocation.name, coordinates: this.currentRoute.endLocation.coordinates }
    ];

    const totalWaypoints = waypoints.length;
    
    // Ensure nextWaypointIndex is properly bounded
    if (this.movement.nextWaypointIndex >= totalWaypoints) {
      this.movement.nextWaypointIndex = totalWaypoints - 1; // Stay at final waypoint
    }
    
    // For currentWaypoint: show the waypoint we just passed or are at
    const currentIndex = Math.max(0, this.movement.nextWaypointIndex - 1);
    // For nextWaypoint: show the waypoint we're heading towards
    const nextIndex = this.movement.nextWaypointIndex;
    
    const completedWaypoints = Math.max(0, currentIndex);
    const progressPercentage = totalWaypoints > 1 ? 
      Math.round((completedWaypoints / (totalWaypoints - 1)) * 100) : 100;

    // Current waypoint (the one we just passed or are currently at)
    const currentWaypoint = currentIndex >= 0 && currentIndex < totalWaypoints ? waypoints[currentIndex] : null;
    
    // Next waypoint (the one we're heading towards)
    const nextWaypoint = nextIndex < totalWaypoints ? waypoints[nextIndex] : null;

    return {
      currentWaypoint: currentWaypoint ? {
        name: currentWaypoint.name,
        coordinates: {
          latitude: currentWaypoint.coordinates.latitude,
          longitude: currentWaypoint.coordinates.longitude
        },
        index: currentIndex
      } : null,
      nextWaypoint: nextWaypoint ? {
        name: nextWaypoint.name,
        coordinates: {
          latitude: nextWaypoint.coordinates.latitude,
          longitude: nextWaypoint.coordinates.longitude
        },
        index: nextIndex
      } : null,
      routeProgress: {
        completedWaypoints: completedWaypoints,
        totalWaypoints: totalWaypoints,
        progressPercentage: progressPercentage
      }
    };
  }

  /**
   * Calculate distance and duration information for current position
   */
  generateDistanceAndDurationInfo() {
    if (!this.currentRoute || !this.currentRoute.waypoints) {
      return {
        distanceInfo: {
          totalRouteDistance: 0,
          distanceTraveled: 0,
          remainingDistance: 0,
          distanceToNextWaypoint: 0
        },
        durationInfo: {
          estimatedTotalDuration: 0,
          elapsedDuration: 0,
          estimatedRemainingDuration: 0,
          estimatedArrival: null
        }
      };
    }

    // Build complete waypoint list
    const waypoints = [
      this.currentRoute.startLocation.coordinates,
      ...this.currentRoute.waypoints.map(wp => wp.coordinates),
      this.currentRoute.endLocation.coordinates
    ];

    // Calculate total route distance
    let totalRouteDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalRouteDistance += this.calculateDistance(waypoints[i], waypoints[i + 1]);
    }

    // Calculate distance traveled so far
    let distanceTraveled = 0;
    for (let i = 0; i < this.movement.nextWaypointIndex; i++) {
      if (i < waypoints.length - 1) {
        distanceTraveled += this.calculateDistance(waypoints[i], waypoints[i + 1]);
      }
    }

    // Add distance from last completed waypoint to current position
    if (this.movement.nextWaypointIndex > 0 && this.movement.nextWaypointIndex <= waypoints.length) {
      const lastWaypoint = waypoints[this.movement.nextWaypointIndex - 1];
      distanceTraveled += this.calculateDistance(lastWaypoint, this.currentPosition);
    }

    // Calculate remaining distance to destination
    const remainingDistance = Math.max(0, totalRouteDistance - distanceTraveled);

    // Calculate distance to next waypoint
    let distanceToNextWaypoint = 0;
    if (this.movement.nextWaypointIndex < waypoints.length) {
      const nextWaypoint = waypoints[this.movement.nextWaypointIndex];
      distanceToNextWaypoint = this.calculateDistance(this.currentPosition, nextWaypoint);
    }

    // Calculate duration information
    const currentSpeed = this.movement.speed > 0 ? this.movement.speed : 30; // Default 30 km/h if stationary
    
    // Calculate realistic elapsed duration based on route progress
    let elapsedDuration = 0;
    if (this.actualTripStartTime) {
      elapsedDuration = Math.round((Date.now() - this.actualTripStartTime.getTime()) / (1000 * 60)); // in minutes
    } else {
      // If no actual start time, estimate based on route progress
      const progressPercentage = this.movement.nextWaypointIndex / waypoints.length;
      const averageSpeed = 35; // km/h
      const estimatedTimeForProgress = Math.round((totalRouteDistance * progressPercentage / averageSpeed) * 60);
      elapsedDuration = Math.min(estimatedTimeForProgress, 30); // Cap at 30 minutes for realism
    }

    // Estimate total duration based on route distance and average speed
    const averageSpeed = 35; // Average speed in km/h for estimation
    const estimatedTotalDuration = Math.round((totalRouteDistance / averageSpeed) * 60); // in minutes

    // Estimate remaining duration based on remaining distance and current speed
    const estimatedRemainingDuration = Math.round((remainingDistance / currentSpeed) * 60); // in minutes

    // Calculate estimated arrival time
    const estimatedArrival = new Date(Date.now() + (estimatedRemainingDuration * 60 * 1000));

    return {
      distanceInfo: {
        totalRouteDistance: parseFloat(totalRouteDistance.toFixed(2)),
        distanceTraveled: parseFloat(distanceTraveled.toFixed(2)),
        remainingDistance: parseFloat(remainingDistance.toFixed(2)),
        distanceToNextWaypoint: parseFloat(distanceToNextWaypoint.toFixed(2))
      },
      durationInfo: {
        estimatedTotalDuration: estimatedTotalDuration,
        elapsedDuration: elapsedDuration,
        estimatedRemainingDuration: estimatedRemainingDuration,
        estimatedArrival: estimatedArrival
      }
    };
  }

  /**
   * Check for various alerts
   */
  checkAlerts() {
    return {
      speedingAlert: this.movement.speed > this.currentRoute.maxSpeed,
      lowBatteryAlert: this.batteryLevel < 20,
      signalLossAlert: this.signalStrength === 'no-signal',
      routeDeviationAlert: false, // Could implement route deviation logic
      emergencyAlert: false
    };
  }
  
  /**
   * Update device battery level
   */
  updateBattery() {
    const drainRate = parseFloat(process.env.BATTERY_DRAIN_RATE) || 0.1;
    this.batteryLevel = Math.max(0, this.batteryLevel - drainRate);
    
    if (this.batteryLevel <= 0) {
      this.isActive = false;
      this.stopTracking();
      this.emit('deviceShutdown', {
        deviceId: this.deviceId,
        reason: 'battery_depleted'
      });
    }
  }
  
  /**
   * Simulate signal strength variations
   */
  checkSignalStrength() {
    const random = Math.random();
    
    if (random < 0.05) { // 5% chance
      this.signalStrength = 'poor';
    } else if (random < 0.15) { // 10% chance
      this.signalStrength = 'fair';
    } else if (random < 0.3) { // 15% chance
      this.signalStrength = 'good';
    } else { // 70% chance
      this.signalStrength = 'excellent';
    }
  }
  
  /**
   * Generate realistic GPS accuracy (in meters)
   */
  generateAccuracy() {
    const min = parseInt(process.env.GPS_ACCURACY_MIN) || 5;
    const max = parseInt(process.env.GPS_ACCURACY_MAX) || 50;
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Calculate bearing between two coordinates
   */
  calculateBearing(pos1, pos2) {
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const lat1 = pos1.latitude * Math.PI / 180;
    const lat2 = pos2.latitude * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }
  
  /**
   * Trigger route completion process
   */
  async triggerRouteCompletion() {
    if (!this.actualTripStartTime || !this.currentRoute) {
      console.log(`⚠️  Cannot complete route for ${this.busId} - missing trip start time or route`);
      return;
    }

    const journeyEndTime = new Date();
    const totalJourneyDuration = Math.round((journeyEndTime - this.actualTripStartTime) / (1000 * 60)); // in minutes
    
    // Calculate total distance and average speed
    const totalDistance = this.currentRoute.distance || 0;
    const averageSpeed = totalDistance > 0 && totalJourneyDuration > 0 
      ? Math.round((totalDistance / (totalJourneyDuration / 60)) * 100) / 100 
      : 0;

    const completionData = {
      busId: this.busId,
      routeId: this.currentRoute.routeId,
      routeName: this.currentRoute.routeName,
      registrationNumber: this.bus.registrationNumber,
      gpsDeviceId: this.deviceId,
      startLocation: this.currentRoute.startLocation,
      endLocation: this.currentRoute.endLocation,
      journeyStartTime: this.actualTripStartTime,
      journeyEndTime: journeyEndTime,
      totalJourneyDuration: totalJourneyDuration,
      finalCoordinates: {
        latitude: this.currentPosition.latitude,
        longitude: this.currentPosition.longitude,
        accuracy: this.currentPosition.accuracy,
        altitude: this.currentPosition.altitude
      },
      routeCompletion: {
        totalWaypoints: this.currentRoute.waypoints.length + 2, // +2 for start and end
        completedWaypoints: this.currentRoute.waypoints.length + 2,
        completionPercentage: 100
      },
      journeySummary: {
        totalDistance: totalDistance,
        averageSpeed: averageSpeed,
        estimatedDuration: this.currentRoute.estimatedDuration || 0,
        actualDuration: totalJourneyDuration
      },
      finalMovement: {
        speed: this.movement.speed,
        heading: this.movement.heading,
        isMoving: this.movement.isMoving
      },
      completionStatus: 'completed',
      completionMetadata: {
        completionMethod: 'waypoint_reached',
        proximityToDestination: 0 // Reached final waypoint
      }
    };

    console.log(`📋 Bus ${this.busId} route completion summary:`);
    console.log(`   📍 Route: ${this.currentRoute.routeName}`);
    console.log(`   ⏱️  Duration: ${totalJourneyDuration} minutes`);
    console.log(`   📏 Distance: ${totalDistance} km`);
    console.log(`   🚄 Average Speed: ${averageSpeed} km/h`);

    // Emit completion event for API to handle
    this.emit('routeCompleted', completionData);
  }
  
  /**
   * Get device status
   */
  getStatus() {
    return {
      deviceId: this.deviceId,
      busId: this.busId,
      isActive: this.isActive,
      batteryLevel: this.batteryLevel,
      signalStrength: this.signalStrength,
      currentRoute: this.currentRoute?.routeId,
      currentTrip: this.currentTrip?.tripId,
      lastUpdate: this.lastUpdate,
      position: this.currentPosition,
      movement: this.movement
    };
  }
}

export default GPSDevice;