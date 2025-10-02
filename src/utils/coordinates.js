/**
 * GPS Coordinate Utilities
 * Helper functions for GPS coordinate manipulation and generation
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique location ID
 */
export function generateLocationId(busId) {
  const timestamp = Date.now();
  return `LOC_${busId}_${timestamp}`;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {Object} pos1 - First position {latitude, longitude}
 * @param {Object} pos2 - Second position {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(pos1, pos2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(pos2.latitude - pos1.latitude);
  const dLon = toRadians(pos2.longitude - pos1.longitude);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(pos1.latitude)) * Math.cos(toRadians(pos2.latitude)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate bearing between two GPS coordinates
 * @param {Object} pos1 - Starting position {latitude, longitude}
 * @param {Object} pos2 - Ending position {latitude, longitude}  
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(pos1, pos2) {
  const dLon = toRadians(pos2.longitude - pos1.longitude);
  const lat1 = toRadians(pos1.latitude);
  const lat2 = toRadians(pos2.latitude);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Move GPS coordinates by distance and bearing
 * @param {Object} position - Starting position {latitude, longitude}
 * @param {number} distance - Distance to move in kilometers
 * @param {number} bearing - Bearing in degrees
 * @returns {Object} New position {latitude, longitude}
 */
export function moveCoordinates(position, distance, bearing) {
  const R = 6371; // Earth's radius in km
  const lat1 = toRadians(position.latitude);
  const lon1 = toRadians(position.longitude);
  const bearingRad = toRadians(bearing);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2)
  };
}

/**
 * Generate intermediate waypoints between two coordinates
 * @param {Object} start - Starting position {latitude, longitude}
 * @param {Object} end - Ending position {latitude, longitude}
 * @param {number} segments - Number of segments to divide the route into
 * @returns {Array} Array of waypoint coordinates
 */
export function generateWaypoints(start, end, segments = 10) {
  const waypoints = [];
  
  for (let i = 1; i < segments; i++) {
    const ratio = i / segments;
    const lat = start.latitude + (end.latitude - start.latitude) * ratio;
    const lon = start.longitude + (end.longitude - start.longitude) * ratio;
    
    waypoints.push({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lon.toFixed(6))
    });
  }
  
  return waypoints;
}

/**
 * Check if coordinates are within Sri Lanka bounds
 * @param {Object} coordinates - {latitude, longitude}
 * @returns {boolean} True if within Sri Lanka
 */
export function isWithinSriLanka(coordinates) {
  const bounds = {
    north: 9.9,    // Northernmost point (Point Pedro)
    south: 5.9,    // Southernmost point (Dondra Head)
    east: 81.9,    // Easternmost point
    west: 79.5     // Westernmost point
  };
  
  return (
    coordinates.latitude >= bounds.south &&
    coordinates.latitude <= bounds.north &&
    coordinates.longitude >= bounds.west &&
    coordinates.longitude <= bounds.east
  );
}

/**
 * Add realistic GPS noise to coordinates
 * @param {Object} coordinates - {latitude, longitude}
 * @param {number} accuracyMeters - GPS accuracy in meters
 * @returns {Object} Noisy coordinates
 */
export function addGPSNoise(coordinates, accuracyMeters = 10) {
  // Convert accuracy to degrees (approximate)
  const accuracyDegrees = accuracyMeters / 111000; // 1 degree ≈ 111km
  
  const latNoise = (Math.random() - 0.5) * accuracyDegrees;
  const lonNoise = (Math.random() - 0.5) * accuracyDegrees;
  
  return {
    latitude: coordinates.latitude + latNoise,
    longitude: coordinates.longitude + lonNoise
  };
}

/**
 * Validate GPS coordinates
 * @param {Object} coordinates - {latitude, longitude}
 * @returns {boolean} True if valid coordinates
 */
export function validateCoordinates(coordinates) {
  if (!coordinates || typeof coordinates !== 'object') return false;
  
  const { latitude, longitude } = coordinates;
  
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
}

/**
 * Format coordinates for display
 * @param {Object} coordinates - {latitude, longitude}
 * @param {number} precision - Decimal places
 * @returns {string} Formatted coordinate string
 */
export function formatCoordinates(coordinates, precision = 6) {
  if (!validateCoordinates(coordinates)) {
    return 'Invalid coordinates';
  }
  
  const lat = coordinates.latitude.toFixed(precision);
  const lon = coordinates.longitude.toFixed(precision);
  
  return `${lat}, ${lon}`;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Generate random coordinates within a bounding box
 * @param {Object} bounds - {north, south, east, west}
 * @returns {Object} Random coordinates {latitude, longitude}
 */
export function generateRandomCoordinates(bounds) {
  const latitude = bounds.south + Math.random() * (bounds.north - bounds.south);
  const longitude = bounds.west + Math.random() * (bounds.east - bounds.west);
  
  return {
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6))
  };
}

/**
 * Calculate the center point of multiple coordinates
 * @param {Array} coordinates - Array of {latitude, longitude} objects
 * @returns {Object} Center coordinates {latitude, longitude}
 */
export function calculateCenter(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    throw new Error('No coordinates provided');
  }
  
  let totalLat = 0;
  let totalLon = 0;
  
  for (const coord of coordinates) {
    totalLat += coord.latitude;
    totalLon += coord.longitude;
  }
  
  return {
    latitude: parseFloat((totalLat / coordinates.length).toFixed(6)),
    longitude: parseFloat((totalLon / coordinates.length).toFixed(6))
  };
}

/**
 * Check if a point is within a certain radius of a center point
 * @param {Object} center - Center point {latitude, longitude}
 * @param {Object} point - Point to check {latitude, longitude}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if point is within radius
 */
export function isWithinRadius(center, point, radiusKm) {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

export default {
  generateLocationId,
  calculateDistance,
  calculateBearing,
  moveCoordinates,
  generateWaypoints,
  isWithinSriLanka,
  addGPSNoise,
  validateCoordinates,
  formatCoordinates,
  generateRandomCoordinates,
  calculateCenter,
  isWithinRadius
};