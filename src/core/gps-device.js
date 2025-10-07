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
      // Set trip start time only once when starting a truly new trip
      if (!this.actualTripStartTime) {
        this.actualTripStartTime = new Date();
        console.log(`🚀 Bus ${this.busId} starting new trip segment at ${this.actualTripStartTime.toLocaleTimeString()}`);
      }

      // Update position logic (same as updatePosition but without the emit)
      this.updatePositionInternal();
      
      // Create and emit location data
      const locationData = this.generateLocationData();
      this.emit('locationUpdate', locationData);
      this.lastUpdate = new Date();

      // If route was completed, reset for next trip now
      if (this.routeCompleted) {
        this.resetForNextTrip();
      }

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
      
      // Store completion flag but don't reset trip data yet
      this.routeCompleted = true;
      
      // Trigger completion process
      this.triggerRouteCompletion();
      
      // Note: We don't reset actualTripStartTime here anymore
      // It will be reset after the final location data is generated
      
      return; // Continue to generate final location data
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
      
      // If route was completed, reset for next trip now
      if (this.routeCompleted) {
        this.resetForNextTrip();
      }
      
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
    
    // Occasionally allow slight speeding (realistic driver behavior) - increased for demo
    const speedLimitTolerance = Math.random() < 0.15 ? 15 : 0; // 15% chance of 15 km/h over limit (increased from 5%)
    const maxAllowedSpeed = route.maxSpeed + speedLimitTolerance;
    
    // Respect speed limits (with occasional tolerance)
    targetSpeed = Math.min(targetSpeed, maxAllowedSpeed);
    targetSpeed = Math.max(targetSpeed, 0);
    
    // Simulate traffic and stops
    if (Math.random() < 0.1) { // 10% chance of stop/slow traffic
      targetSpeed *= Math.random() * 0.5; // Reduce speed by 0-50%
    }
    
    // Simulate highway driving (higher speeds on expressways)
    if (route.routeName?.includes('Highway') || route.routeName?.includes('Express')) {
      if (Math.random() < 0.15) { // 15% chance of higher highway speeds
        targetSpeed = Math.min(targetSpeed * 1.1, maxAllowedSpeed);
      }
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
      
      // Alerts (keeping boolean for API compatibility + adding message fields)
      alerts: {
        speedingAlert: alerts.speedingAlert,
        routeDeviationAlert: alerts.routeDeviationAlert,
        emergencyAlert: alerts.emergencyAlert,
        maintenanceAlert: alerts.maintenanceAlert
      },
      
      // Alert messages as a separate field to bypass API validation
      alertMessages: {
        speedingMessage: alerts.speedingAlert ? `Bus exceeding speed limit by ${Math.round(this.movement.speed - (this.currentRoute.maxSpeed || 80))} km/h` : "Speed within normal limits",
        routeDeviationMessage: alerts.routeDeviationAlert ? "GPS indicates possible route deviation or alternate path" : "Following designated route",
        emergencyMessage: alerts.emergencyAlert ? "Emergency situation detected - immediate attention required" : "No emergency alerts",
        maintenanceMessage: alerts.maintenanceAlert ? this.generateMaintenanceMessage() : "Vehicle systems operating normally"
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

    // Use route's predefined distance and duration for more realistic calculations
    const totalRouteDistance = this.currentRoute.distance || 100; // Use route distance in km
    const routeEstimatedDuration = this.currentRoute.estimatedDuration || Math.round((totalRouteDistance / 50) * 60); // Use route duration in minutes

    // Calculate distance traveled based on waypoint progress
    const totalWaypoints = waypoints.length - 1; // Number of segments
    const completedSegments = Math.min(this.movement.nextWaypointIndex, totalWaypoints);
    let progressPercentage = completedSegments / totalWaypoints;
    
    // Add micro-progress within current segment if not at destination
    if (this.movement.nextWaypointIndex < waypoints.length && this.movement.nextWaypointIndex > 0) {
      const currentSegmentStart = waypoints[this.movement.nextWaypointIndex - 1];
      const currentSegmentEnd = waypoints[this.movement.nextWaypointIndex];
      const currentSegmentDistance = this.calculateDistance(currentSegmentStart, currentSegmentEnd);
      const distanceFromSegmentStart = this.calculateDistance(currentSegmentStart, this.currentPosition);
      const segmentProgress = Math.min(distanceFromSegmentStart / currentSegmentDistance, 1);
      
      // Add the progress within current segment
      const additionalProgress = segmentProgress / totalWaypoints;
      progressPercentage = Math.min((completedSegments + additionalProgress) / totalWaypoints, 1);
    }

    const distanceTraveled = totalRouteDistance * progressPercentage;
    const remainingDistance = Math.max(0, totalRouteDistance - distanceTraveled);

    // Calculate distance to next waypoint
    let distanceToNextWaypoint = 0;
    if (this.movement.nextWaypointIndex < waypoints.length) {
      const nextWaypoint = waypoints[this.movement.nextWaypointIndex];
      distanceToNextWaypoint = this.calculateDistance(this.currentPosition, nextWaypoint);
    }

    // Calculate duration information using realistic logic
    let elapsedDuration = 0;
    let estimatedTotalDuration = routeEstimatedDuration;
    let estimatedRemainingDuration = 0;

    if (this.actualTripStartTime) {
      // For simulation purposes, calculate realistic elapsed time based on route progress and waypoints
      const waypointProgress = this.movement.nextWaypointIndex;
      const baseElapsedTime = Math.round(estimatedTotalDuration * progressPercentage);
      const waypointBasedTime = Math.max(waypointProgress * 2, 1); // 2 minutes per waypoint, minimum 1
      
      // Use the higher of progress-based time or waypoint-based time for realistic simulation
      elapsedDuration = Math.max(baseElapsedTime, waypointBasedTime);
      
      // If the trip is complete (100% progress), remaining should be 0
      if (progressPercentage >= 1.0) {
        elapsedDuration = estimatedTotalDuration;
        estimatedRemainingDuration = 0;
      } else {
        // For ongoing trips, calculate remaining duration
        estimatedRemainingDuration = Math.max(0, estimatedTotalDuration - elapsedDuration);
      }
    } else {
      // Estimate elapsed time based on route progress with better granularity
      const baseElapsedTime = Math.round(estimatedTotalDuration * progressPercentage);
      
      // Add some realistic variation based on waypoint progression
      const waypointProgress = this.movement.nextWaypointIndex;
      const additionalTime = Math.min(waypointProgress * 2, 10); // Add 2 minutes per waypoint, max 10
      
      elapsedDuration = Math.max(baseElapsedTime + additionalTime, 1); // Minimum 1 minute for active trips
      
      // If trip is complete, remaining should be 0
      if (progressPercentage >= 1.0) {
        elapsedDuration = estimatedTotalDuration;
        estimatedRemainingDuration = 0;
      } else {
        estimatedRemainingDuration = Math.max(0, estimatedTotalDuration - elapsedDuration);
      }
    }

    // Final consistency check: ensure elapsed + remaining = total for mathematical accuracy
    const calculatedTotal = elapsedDuration + estimatedRemainingDuration;
    if (Math.abs(calculatedTotal - estimatedTotalDuration) > 5) { // Allow 5 minute tolerance
      // Adjust remaining duration to maintain consistency
      estimatedRemainingDuration = Math.max(0, estimatedTotalDuration - elapsedDuration);
    }

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
   * Reset bus for next trip after route completion
   */
  resetForNextTrip() {
    console.log(`🔄 Bus ${this.busId} resetting for next trip`);
    
    // Reset trip-related properties
    this.movement.nextWaypointIndex = 0;
    this.stepsAtCurrentWaypoint = 0;
    this.actualTripStartTime = null;
    this.routeCompleted = false;
    
    // Reset position to start location
    this.currentPosition = { 
      ...this.currentRoute.startLocation.coordinates,
      accuracy: 5 + Math.random() * 10,
      altitude: Math.floor(Math.random() * 100 + 50)
    };
    
    console.log(`🔄 Bus ${this.busId} restarted from ${this.currentRoute.startLocation.name}`);
  }

  /**
   * Check for various alerts
   */
  checkAlerts() {
    // Realistic Sri Lankan bus alert scenarios
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    // Speed-based alerts
    const maxSpeed = this.currentRoute.maxSpeed || 80; // Default 80 km/h for Sri Lankan highways
    const speedingAlert = this.movement.speed > maxSpeed;
    
    // Route deviation - simulate occasional GPS drift or alternate routes (increased for demo)
    const routeDeviationAlert = Math.random() < 0.08; // 8% chance of route deviation (increased from 2%)
    
    // Emergency alerts - simulate rare emergency situations (increased for demo)
    const emergencyAlert = Math.random() < 0.03; // 3% chance of emergency (increased from 0.1%)
    
    // Maintenance alerts based on realistic scenarios (increased for demo)
    let maintenanceAlert = false;
    
    // Higher maintenance alerts during peak hours (7-9 AM, 5-7 PM)
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
      maintenanceAlert = Math.random() < 0.06; // 6% chance during peak hours
    } else {
      maintenanceAlert = Math.random() < 0.04; // 4% chance during off-peak
    }
    
    // Additional realistic conditions
    if (this.batteryLevel < 30) {
      maintenanceAlert = true; // Low battery triggers maintenance alert
    }
    
    if (this.signalStrength === 'poor' && Math.random() < 0.5) {
      routeDeviationAlert = true; // Poor signal can cause route deviation alerts
    }
    
    return {
      speedingAlert,
      routeDeviationAlert,
      emergencyAlert,
      maintenanceAlert
    };
  }

  /**
   * Generate specific maintenance alert messages
   */
  generateMaintenanceMessage() {
    if (this.batteryLevel < 30) {
      return `Low battery level: ${this.batteryLevel.toFixed(1)}% - charging required`;
    }
    
    const maintenanceTypes = [
      "Scheduled maintenance due - engine service required",
      "Tire pressure monitoring system alert",
      "Brake system inspection needed",
      "Air conditioning service required",
      "Engine temperature running high",
      "Fuel system efficiency check needed",
      "Transmission service overdue",
      "Electrical system diagnostic required"
    ];
    
    return maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
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
   * Simulate signal strength variations based on Sri Lankan terrain
   */
  checkSignalStrength() {
    const random = Math.random();
    
    // Signal strength varies based on route and terrain
    // Mountain routes (Kandy-Nuwara Eliya) have poorer signal
    const isMountainRoute = this.currentRoute.routeId === 'RT008' || 
                           this.currentRoute.routeName?.includes('Nuwara Eliya') ||
                           this.currentRoute.routeName?.includes('Kandy');
    
    // Rural/Eastern routes may have weaker signals
    const isRuralRoute = this.currentRoute.routeName?.includes('Batticaloa') ||
                        this.currentRoute.routeName?.includes('Trincomalee') ||
                        this.currentRoute.routeName?.includes('Anuradhapura');
    
    if (isMountainRoute) {
      // Mountain routes have more signal variations
      if (random < 0.15) { // 15% chance
        this.signalStrength = 'poor';
      } else if (random < 0.35) { // 20% chance
        this.signalStrength = 'fair';
      } else if (random < 0.65) { // 30% chance
        this.signalStrength = 'good';
      } else { // 35% chance
        this.signalStrength = 'excellent';
      }
    } else if (isRuralRoute) {
      // Rural routes have moderate signal variations
      if (random < 0.10) { // 10% chance
        this.signalStrength = 'poor';
      } else if (random < 0.25) { // 15% chance
        this.signalStrength = 'fair';
      } else if (random < 0.50) { // 25% chance
        this.signalStrength = 'good';
      } else { // 50% chance
        this.signalStrength = 'excellent';
      }
    } else {
      // Urban/highway routes have better signal
      if (random < 0.03) { // 3% chance
        this.signalStrength = 'poor';
      } else if (random < 0.10) { // 7% chance
        this.signalStrength = 'fair';
      } else if (random < 0.25) { // 15% chance
        this.signalStrength = 'good';
      } else { // 75% chance
        this.signalStrength = 'excellent';
      }
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