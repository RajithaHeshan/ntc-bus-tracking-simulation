/**
 * Sri Lankan Bus Route Configurations
 * Contains GPS coordinates and route details for major intercity routes
 */

export const routes = [
  {
    routeId: "RT001",
    routeName: "Colombo - Kandy Express",
    startLocation: {
      name: "Colombo Central Bus Stand",
      city: "Colombo",
      province: "Western Province",
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    endLocation: {
      name: "Kandy Bus Terminal",
      city: "Kandy", 
      province: "Central Province",
      coordinates: { latitude: 7.2966, longitude: 80.6350 }
    },
    distance: 115,
    estimatedDuration: 180, // 3 hours
    waypoints: [
      { name: "Kadawatha", coordinates: { latitude: 7.0014, longitude: 79.9547 } },
      { name: "Nittambuwa", coordinates: { latitude: 7.1381, longitude: 80.0981 } },
      { name: "Pasyala", coordinates: { latitude: 7.1667, longitude: 80.1167 } },
      { name: "Kegalle", coordinates: { latitude: 7.2513, longitude: 80.3464 } },
      { name: "Mawanella", coordinates: { latitude: 7.2497, longitude: 80.4569 } },
      { name: "Kadugannawa", coordinates: { latitude: 7.2545, longitude: 80.5241 } }
    ],
    maxSpeed: 80,
    averageSpeed: 45
  },
  {
    routeId: "RT002", 
    routeName: "Colombo - Galle Southern Highway",
    startLocation: {
      name: "Colombo Bastian Mawatha",
      city: "Colombo",
      province: "Western Province", 
      coordinates: { latitude: 6.9319, longitude: 79.8478 }
    },
    endLocation: {
      name: "Galle Bus Station",
      city: "Galle",
      province: "Southern Province",
      coordinates: { latitude: 6.0535, longitude: 80.2210 }
    },
    distance: 119,
    estimatedDuration: 120, // 2 hours
    waypoints: [
      { name: "Panadura", coordinates: { latitude: 6.7132, longitude: 79.9026 } },
      { name: "Kalutara", coordinates: { latitude: 6.5854, longitude: 79.9607 } },
      { name: "Beruwala", coordinates: { latitude: 6.4792, longitude: 79.9829 } },
      { name: "Bentota", coordinates: { latitude: 6.4256, longitude: 79.9951 } },
      { name: "Hikkaduwa", coordinates: { latitude: 6.1419, longitude: 80.1013 } }
    ],
    maxSpeed: 100,
    averageSpeed: 60
  },
  {
    routeId: "RT003",
    routeName: "Colombo - Matara Coastal Express", 
    startLocation: {
      name: "Colombo Central",
      city: "Colombo",
      province: "Western Province",
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    endLocation: {
      name: "Matara Bus Terminal",
      city: "Matara",
      province: "Southern Province", 
      coordinates: { latitude: 5.9549, longitude: 80.5550 }
    },
    distance: 160,
    estimatedDuration: 180, // 3 hours
    waypoints: [
      { name: "Panadura", coordinates: { latitude: 6.7132, longitude: 79.9026 } },
      { name: "Kalutara", coordinates: { latitude: 6.5854, longitude: 79.9607 } },
      { name: "Bentota", coordinates: { latitude: 6.4256, longitude: 79.9951 } },
      { name: "Galle", coordinates: { latitude: 6.0535, longitude: 80.2210 } },
      { name: "Unawatuna", coordinates: { latitude: 6.0108, longitude: 80.2492 } },
      { name: "Weligama", coordinates: { latitude: 5.9754, longitude: 80.4293 } }
    ],
    maxSpeed: 80,
    averageSpeed: 50
  },
  {
    routeId: "RT004",
    routeName: "Colombo - Anuradhapura Ancient City Express",
    startLocation: {
      name: "Colombo Pettah",
      city: "Colombo", 
      province: "Western Province",
      coordinates: { latitude: 6.9388, longitude: 79.8653 }
    },
    endLocation: {
      name: "Anuradhapura New Bus Stand", 
      city: "Anuradhapura",
      province: "North Central Province",
      coordinates: { latitude: 8.3114, longitude: 80.4037 }
    },
    distance: 205,
    estimatedDuration: 270, // 4.5 hours
    waypoints: [
      { name: "Negombo", coordinates: { latitude: 7.2083, longitude: 79.8358 } },
      { name: "Chilaw", coordinates: { latitude: 7.5759, longitude: 79.7951 } },
      { name: "Puttalam", coordinates: { latitude: 8.0362, longitude: 79.8283 } },
      { name: "Kurunegala", coordinates: { latitude: 7.4818, longitude: 80.3653 } },
      { name: "Dambulla", coordinates: { latitude: 7.8731, longitude: 80.6511 } }
    ],
    maxSpeed: 70,
    averageSpeed: 45
  },
  {
    routeId: "RT005", 
    routeName: "Kandy - Jaffna Northern Express",
    startLocation: {
      name: "Kandy Bus Terminal",
      city: "Kandy",
      province: "Central Province",
      coordinates: { latitude: 7.2966, longitude: 80.6350 }
    },
    endLocation: {
      name: "Jaffna Central Bus Stand",
      city: "Jaffna", 
      province: "Northern Province",
      coordinates: { latitude: 9.6615, longitude: 80.0255 }
    },
    distance: 290,
    estimatedDuration: 360, // 6 hours
    waypoints: [
      { name: "Dambulla", coordinates: { latitude: 7.8731, longitude: 80.6511 } },
      { name: "Anuradhapura", coordinates: { latitude: 8.3114, longitude: 80.4037 } },
      { name: "Vavuniya", coordinates: { latitude: 8.7514, longitude: 80.4971 } },
      { name: "Kilinochchi", coordinates: { latitude: 9.3806, longitude: 80.4036 } }
    ],
    maxSpeed: 70,
    averageSpeed: 50
  },
  {
    routeId: "RT006",
    routeName: "Colombo - Trincomalee Eastern Express",
    startLocation: {
      name: "Colombo Bastian Mawatha", 
      city: "Colombo",
      province: "Western Province",
      coordinates: { latitude: 6.9319, longitude: 79.8478 }
    },
    endLocation: {
      name: "Trincomalee Bus Station",
      city: "Trincomalee",
      province: "Eastern Province", 
      coordinates: { latitude: 8.5874, longitude: 81.2152 }
    },
    distance: 257,
    estimatedDuration: 330, // 5.5 hours  
    waypoints: [
      { name: "Kadawatha", coordinates: { latitude: 7.0014, longitude: 79.9547 } },
      { name: "Kurunegala", coordinates: { latitude: 7.4818, longitude: 80.3653 } },
      { name: "Dambulla", coordinates: { latitude: 7.8731, longitude: 80.6511 } },
      { name: "Habarana", coordinates: { latitude: 8.0367, longitude: 80.7514 } },
      { name: "Polonnaruwa", coordinates: { latitude: 7.9403, longitude: 81.0188 } }
    ],
    maxSpeed: 70,
    averageSpeed: 47
  },
  {
    routeId: "RT007",
    routeName: "Colombo - Batticaloa Eastern Coast", 
    startLocation: {
      name: "Colombo Central",
      city: "Colombo",
      province: "Western Province",
      coordinates: { latitude: 6.9271, longitude: 79.8612 }
    },
    endLocation: {
      name: "Batticaloa Bus Terminal",
      city: "Batticaloa",
      province: "Eastern Province",
      coordinates: { latitude: 7.7102, longitude: 81.6924 }
    },
    distance: 314,
    estimatedDuration: 390, // 6.5 hours
    waypoints: [
      { name: "Avissawella", coordinates: { latitude: 6.9553, longitude: 80.2114 } },
      { name: "Ratnapura", coordinates: { latitude: 6.6828, longitude: 80.3992 } },
      { name: "Embilipitiya", coordinates: { latitude: 6.3431, longitude: 80.8497 } },
      { name: "Monaragala", coordinates: { latitude: 6.8728, longitude: 81.3510 } },
      { name: "Ampara", coordinates: { latitude: 7.2967, longitude: 81.6747 } }
    ],
    maxSpeed: 65,
    averageSpeed: 48
  },
  {
    routeId: "RT008",
    routeName: "Kandy - Nuwara Eliya Hill Country",
    startLocation: {
      name: "Kandy Clock Tower",
      city: "Kandy", 
      province: "Central Province",
      coordinates: { latitude: 7.2906, longitude: 80.6337 }
    },
    endLocation: {
      name: "Nuwara Eliya Bus Stand", 
      city: "Nuwara Eliya",
      province: "Central Province", 
      coordinates: { latitude: 6.9497, longitude: 80.7891 }
    },
    distance: 78,
    estimatedDuration: 150, // 2.5 hours (hill country)
    waypoints: [
      { name: "Peradeniya", coordinates: { latitude: 7.2599, longitude: 80.5977 } },
      { name: "Gampola", coordinates: { latitude: 7.1647, longitude: 80.5736 } },
      { name: "Nawalapitiya", coordinates: { latitude: 7.0436, longitude: 80.5342 } },
      { name: "Hatton", coordinates: { latitude: 6.8931, longitude: 80.5958 } }
    ],
    maxSpeed: 50,
    averageSpeed: 31
  }
];

export default routes;