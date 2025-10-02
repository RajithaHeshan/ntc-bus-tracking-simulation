/**
 * Sri Lankan Location Data Generator
 * Generates realistic addresses, landmarks, and road names based on GPS coordinates
 */

// Sri Lankan landmarks and their coordinates
export const sriLankanLandmarks = [
  // Colombo Area
  { name: "Galle Face Green", coordinates: { latitude: 6.9271, longitude: 79.8612 }, city: "Colombo", province: "Western" },
  { name: "Colombo Fort Railway Station", coordinates: { latitude: 6.9344, longitude: 79.8428 }, city: "Colombo", province: "Western" },
  { name: "Gangaramaya Temple", coordinates: { latitude: 6.9161, longitude: 79.8561 }, city: "Colombo", province: "Western" },
  { name: "National Museum", coordinates: { latitude: 6.9005, longitude: 79.8612 }, city: "Colombo", province: "Western" },
  { name: "Viharamahadevi Park", coordinates: { latitude: 6.9123, longitude: 79.8607 }, city: "Colombo", province: "Western" },
  
  // Kandy Area  
  { name: "Temple of the Sacred Tooth Relic", coordinates: { latitude: 7.2906, longitude: 80.6337 }, city: "Kandy", province: "Central" },
  { name: "Kandy Lake", coordinates: { latitude: 7.2916, longitude: 80.6340 }, city: "Kandy", province: "Central" },
  { name: "Royal Botanical Gardens", coordinates: { latitude: 7.2599, longitude: 80.5977 }, city: "Peradeniya", province: "Central" },
  { name: "University of Peradeniya", coordinates: { latitude: 7.2547, longitude: 80.5956 }, city: "Peradeniya", province: "Central" },
  
  // Galle Area
  { name: "Galle Dutch Fort", coordinates: { latitude: 6.0535, longitude: 80.2210 }, city: "Galle", province: "Southern" },
  { name: "Galle Lighthouse", coordinates: { latitude: 6.0205, longitude: 80.2174 }, city: "Galle", province: "Southern" },
  { name: "Unawatuna Beach", coordinates: { latitude: 6.0108, longitude: 80.2492 }, city: "Unawatuna", province: "Southern" },
  
  // Anuradhapura Area
  { name: "Sri Maha Bodhi", coordinates: { latitude: 8.3444, longitude: 80.3962 }, city: "Anuradhapura", province: "North Central" },
  { name: "Ruwanwelisaya", coordinates: { latitude: 8.3497, longitude: 80.3961 }, city: "Anuradhapura", province: "North Central" },
  { name: "Jetavanaramaya", coordinates: { latitude: 8.3525, longitude: 80.4037 }, city: "Anuradhapura", province: "North Central" },
  
  // Other Areas
  { name: "Sigiriya Rock Fortress", coordinates: { latitude: 7.9570, longitude: 80.7603 }, city: "Sigiriya", province: "Central" },
  { name: "Dambulla Cave Temple", coordinates: { latitude: 7.8731, longitude: 80.6511 }, city: "Dambulla", province: "Central" },
  { name: "Adam's Peak", coordinates: { latitude: 6.8095, longitude: 80.4989 }, city: "Hatton", province: "Central" },
  { name: "Nuwara Eliya Golf Club", coordinates: { latitude: 6.9497, longitude: 80.7891 }, city: "Nuwara Eliya", province: "Central" }
];

// Sri Lankan roads and highways
export const sriLankanRoads = [
  // Major Highways
  { name: "Southern Expressway (E01)", type: "expressway" },
  { name: "Colombo-Katunayake Expressway (E03)", type: "expressway" },
  { name: "Outer Circular Highway (E02)", type: "expressway" },
  
  // A-Grade Roads
  { name: "Colombo-Kandy Road (A1)", type: "main_road" },
  { name: "Colombo-Galle Road (A2)", type: "main_road" },
  { name: "Colombo-Ratnapura Road (A4)", type: "main_road" },
  { name: "Kandy-Jaffna Road (A9)", type: "main_road" },
  { name: "Colombo-Trincomalee Road (A6)", type: "main_road" },
  { name: "Kandy-Batticaloa Road (A5)", type: "main_road" },
  
  // B-Grade Roads
  { name: "Galle-Matara Road (B2)", type: "secondary_road" },
  { name: "Kandy-Nuwara Eliya Road (B13)", type: "secondary_road" },
  { name: "Negombo-Chilaw Road (B3)", type: "secondary_road" },
  
  // Local Roads
  { name: "Galle Face Terrace", type: "local_road" },
  { name: "Marine Drive", type: "local_road" },
  { name: "Peradeniya Road", type: "local_road" },
  { name: "Maradana Road", type: "local_road" },
  { name: "Bauddhaloka Mawatha", type: "local_road" },
  { name: "Duplication Road", type: "local_road" }
];

// Sri Lankan cities and towns
export const sriLankanCities = [
  // Major Cities
  { name: "Colombo", province: "Western", type: "capital" },
  { name: "Kandy", province: "Central", type: "major_city" },
  { name: "Galle", province: "Southern", type: "major_city" },
  { name: "Matara", province: "Southern", type: "major_city" },
  { name: "Anuradhapura", province: "North Central", type: "major_city" },
  { name: "Trincomalee", province: "Eastern", type: "major_city" },
  { name: "Batticaloa", province: "Eastern", type: "major_city" },
  { name: "Jaffna", province: "Northern", type: "major_city" },
  
  // Towns
  { name: "Negombo", province: "Western", type: "town" },
  { name: "Kalutara", province: "Western", type: "town" },
  { name: "Panadura", province: "Western", type: "town" },
  { name: "Kegalle", province: "Sabaragamuwa", type: "town" },
  { name: "Ratnapura", province: "Sabaragamuwa", type: "town" },
  { name: "Nuwara Eliya", province: "Central", type: "town" },
  { name: "Hatton", province: "Central", type: "town" },
  { name: "Dambulla", province: "Central", type: "town" },
  { name: "Kurunegala", province: "North Western", type: "town" },
  { name: "Chilaw", province: "North Western", type: "town" }
];

/**
 * Find nearest landmark to given coordinates
 */
export function findNearestLandmark(latitude, longitude) {
  let nearest = null;
  let minDistance = Infinity;
  
  for (const landmark of sriLankanLandmarks) {
    const distance = calculateDistance(
      { latitude, longitude },
      landmark.coordinates
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = landmark;
    }
  }
  
  return nearest;
}

/**
 * Generate realistic address based on coordinates
 */
export function generateAddress(latitude, longitude, routeName) {
  const nearest = findNearestLandmark(latitude, longitude);
  const distance = calculateDistance({ latitude, longitude }, nearest.coordinates);
  
  // Generate street address
  const houseNumber = Math.floor(Math.random() * 999) + 1;
  let streetName;
  
  if (distance < 1) { // Within 1km of landmark
    streetName = `${nearest.name} Road`;
  } else {
    // Use route-based road name
    const roadIndex = Math.floor(Math.random() * sriLankanRoads.length);
    streetName = sriLankanRoads[roadIndex].name;
  }
  
  return `${houseNumber}, ${streetName}`;
}

/**
 * Generate city name based on coordinates
 */
export function generateCity(latitude, longitude) {
  const nearest = findNearestLandmark(latitude, longitude);
  const distance = calculateDistance({ latitude, longitude }, nearest.coordinates);
  
  if (distance < 5) { // Within 5km of landmark
    return nearest.city;
  } else {
    // Find nearest city from predefined coordinates
    const cityCoordinates = {
      "Colombo": { latitude: 6.9271, longitude: 79.8612 },
      "Kandy": { latitude: 7.2906, longitude: 80.6337 },
      "Galle": { latitude: 6.0535, longitude: 80.2210 },
      "Matara": { latitude: 5.9549, longitude: 80.5550 },
      "Anuradhapura": { latitude: 8.3114, longitude: 80.4037 },
      "Trincomalee": { latitude: 8.5874, longitude: 81.2152 },
      "Batticaloa": { latitude: 7.7102, longitude: 81.6924 },
      "Jaffna": { latitude: 9.6615, longitude: 80.0255 },
      "Negombo": { latitude: 7.2087, longitude: 79.8358 },
      "Kalutara": { latitude: 6.5854, longitude: 79.9607 },
      "Nuwara Eliya": { latitude: 6.9497, longitude: 80.7891 }
    };
    
    let nearestCity = "Colombo"; // default
    let minDistance = Infinity;
    
    for (const [cityName, coords] of Object.entries(cityCoordinates)) {
      const distance = calculateDistance({ latitude, longitude }, coords);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
      }
    }
    
    return nearestCity;
  }
}

/**
 * Generate road name based on coordinates and route
 */
export function generateRoadName(latitude, longitude, routeName) {
  // Try to use route-based road name
  if (routeName.includes("Colombo - Kandy")) {
    return "Colombo-Kandy Road (A1)";
  } else if (routeName.includes("Colombo - Galle")) {
    return "Colombo-Galle Road (A2)";
  } else if (routeName.includes("Colombo - Matara")) {
    return "Galle-Matara Road (B2)";
  } else if (routeName.includes("Colombo - Anuradhapura")) {
    return "Colombo-Puttalam Road (A3)";
  } else if (routeName.includes("Kandy - Jaffna")) {
    return "Kandy-Jaffna Road (A9)";
  } else if (routeName.includes("Colombo - Trincomalee")) {
    return "Colombo-Trincomalee Road (A6)";
  } else if (routeName.includes("Kandy - Nuwara Eliya")) {
    return "Kandy-Nuwara Eliya Road (B13)";
  }
  
  // Fallback to random road
  const roadIndex = Math.floor(Math.random() * sriLankanRoads.length);
  return sriLankanRoads[roadIndex].name;
}

/**
 * Get approximate coordinates for major cities
 */
function getCityCoordinates(cityName) {
  const cityCoords = {
    "Colombo": { latitude: 6.9271, longitude: 79.8612 },
    "Kandy": { latitude: 7.2906, longitude: 80.6337 },
    "Galle": { latitude: 6.0535, longitude: 80.2210 },
    "Matara": { latitude: 5.9549, longitude: 80.5550 },
    "Anuradhapura": { latitude: 8.3114, longitude: 80.4037 },
    "Trincomalee": { latitude: 8.5874, longitude: 81.2152 },
    "Batticaloa": { latitude: 7.7102, longitude: 81.6924 },
    "Jaffna": { latitude: 9.6615, longitude: 80.0255 },
    "Nuwara Eliya": { latitude: 6.9497, longitude: 80.7891 }
  };
  
  return cityCoords[cityName] || null;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(pos1, pos2) {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
  const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default {
  sriLankanLandmarks,
  sriLankanRoads,
  sriLankanCities,
  findNearestLandmark,
  generateAddress,
  generateCity,
  generateRoadName
};