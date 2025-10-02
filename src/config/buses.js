/**
 * Bus Fleet Configuration for GPS Simulator
 * ✅ SYNCED WITH MAIN API - All 28 buses with EXACT registration numbers
 * MEETS LECTURE REQUIREMENTS: 25+ buses and 5+ routes
 */

export const buses = [
  // SLTB Western Province buses (BUS001-BUS005)
  {
    busId: "BUS001",
    registrationNumber: "WP-CAB-1234", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB001",
    operatorName: "SLTB Western Province",
    busType: "Semi-Luxury",
    capacity: 45,
    assignedRoutes: ["RT001", "RT004"],
    gpsDeviceId: "GPS_BUS001_001",
    status: "active"
  },
  {
    busId: "BUS002",
    registrationNumber: "WP-CAC-5678", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB001",
    operatorName: "SLTB Western Province",
    busType: "Express",
    capacity: 52,
    assignedRoutes: ["RT002", "RT003"],
    gpsDeviceId: "GPS_BUS002_001",
    status: "active"
  },
  {
    busId: "BUS003",
    registrationNumber: "WP-CAD-9012", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB001",
    operatorName: "SLTB Western Province",
    busType: "Normal",
    capacity: 65,
    assignedRoutes: ["RT001", "RT006"],
    gpsDeviceId: "GPS_BUS003_001",
    status: "active"
  },
  {
    busId: "BUS004",
    registrationNumber: "WP-CAE-3456", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB001",
    operatorName: "SLTB Western Province",
    busType: "Semi-Luxury",
    capacity: 48,
    assignedRoutes: ["RT007", "RT008"],
    gpsDeviceId: "GPS_BUS004_001",
    status: "active"
  },
  {
    busId: "BUS005",
    registrationNumber: "WP-CAF-7890", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB001",
    operatorName: "SLTB Western Province",
    busType: "Express",
    capacity: 50,
    assignedRoutes: ["RT005", "RT001"],
    gpsDeviceId: "GPS_BUS005_001",
    status: "active"
  },

  // SLTB Central Province buses (BUS006-BUS009)
  {
    busId: "BUS006",
    registrationNumber: "CP-CAA-9101", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB002",
    operatorName: "SLTB Central Province",
    busType: "Hill Country Special",
    capacity: 42,
    assignedRoutes: ["RT008", "RT001"],
    gpsDeviceId: "GPS_BUS006_001",
    status: "active"
  },
  {
    busId: "BUS007",
    registrationNumber: "CP-CAB-1121", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB002",
    operatorName: "SLTB Central Province",
    busType: "Express",
    capacity: 50,
    assignedRoutes: ["RT005", "RT006"],
    gpsDeviceId: "GPS_BUS007_001",
    status: "active"
  },
  {
    busId: "BUS008",
    registrationNumber: "CP-CAC-3141", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB002",
    operatorName: "SLTB Central Province",
    busType: "Semi-Luxury",
    capacity: 46,
    assignedRoutes: ["RT001", "RT004"],
    gpsDeviceId: "GPS_BUS008_001",
    status: "active"
  },
  {
    busId: "BUS009",
    registrationNumber: "CP-CAD-5161", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB002",
    operatorName: "SLTB Central Province",
    busType: "Normal",
    capacity: 62,
    assignedRoutes: ["RT008", "RT007"],
    gpsDeviceId: "GPS_BUS009_001",
    status: "active"
  },

  // SLTB Southern Province buses (BUS010-BUS012)
  {
    busId: "BUS010",
    registrationNumber: "SP-CAA-7181", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB003",
    operatorName: "SLTB Southern Province",
    busType: "Express",
    capacity: 54,
    assignedRoutes: ["RT002", "RT003"],
    gpsDeviceId: "GPS_BUS010_001",
    status: "active"
  },
  {
    busId: "BUS011",
    registrationNumber: "SP-CAB-9202", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB003",
    operatorName: "SLTB Southern Province",
    busType: "Semi-Luxury",
    capacity: 47,
    assignedRoutes: ["RT003", "RT002"],
    gpsDeviceId: "GPS_BUS011_001",
    status: "active"
  },
  {
    busId: "BUS012",
    registrationNumber: "SP-CAC-1223", // ✅ EXACT MATCH FROM API
    operatorId: "SLTB003",
    operatorName: "SLTB Southern Province",
    busType: "Luxury",
    capacity: 40,
    assignedRoutes: ["RT002", "RT007"],
    gpsDeviceId: "GPS_BUS012_001",
    status: "active"
  },

  // Private Operator: Maliban Travels (BUS013-BUS016)
  {
    busId: "BUS013",
    registrationNumber: "WP-MAL-4445", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV001",
    operatorName: "Maliban Travels",
    busType: "Semi-Luxury",
    capacity: 48,
    assignedRoutes: ["RT004", "RT005"],
    gpsDeviceId: "GPS_BUS013_001",
    status: "active"
  },
  {
    busId: "BUS014",
    registrationNumber: "WP-MAL-6667", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV001",
    operatorName: "Maliban Travels",
    busType: "Express",
    capacity: 52,
    assignedRoutes: ["RT006", "RT007"],
    gpsDeviceId: "GPS_BUS014_001",
    status: "active"
  },
  {
    busId: "BUS015",
    registrationNumber: "WP-MAL-8889", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV001",
    operatorName: "Maliban Travels",
    busType: "Semi-Luxury",
    capacity: 48,
    assignedRoutes: ["RT007", "RT001"],
    gpsDeviceId: "GPS_BUS015_001",
    status: "active"
  },
  {
    busId: "BUS016",
    registrationNumber: "WP-MAL-0011", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV001",
    operatorName: "Maliban Travels",
    busType: "Express",
    capacity: 52,
    assignedRoutes: ["RT002", "RT008"],
    gpsDeviceId: "GPS_BUS016_001",
    status: "active"
  },

  // Private Operator: Senani Express (BUS017-BUS019)
  {
    busId: "BUS017",
    registrationNumber: "WP-SEN-2233", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV002",
    operatorName: "Senani Express",
    busType: "Luxury",
    capacity: 38,
    assignedRoutes: ["RT003", "RT002"],
    gpsDeviceId: "GPS_BUS017_001",
    status: "active"
  },
  {
    busId: "BUS018",
    registrationNumber: "WP-SEN-4455", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV002",
    operatorName: "Senani Express",
    busType: "A/C Express",
    capacity: 45,
    assignedRoutes: ["RT007", "RT006"],
    gpsDeviceId: "GPS_BUS018_001",
    status: "active"
  },
  {
    busId: "BUS019",
    registrationNumber: "WP-SEN-6677", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV002",
    operatorName: "Senani Express",
    busType: "Semi-Luxury",
    capacity: 49,
    assignedRoutes: ["RT004", "RT005"],
    gpsDeviceId: "GPS_BUS019_001",
    status: "active"
  },

  // Private Operator: Lanka Ashok Leyland (BUS020-BUS022)
  {
    busId: "BUS020",
    registrationNumber: "WP-LAL-8899", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV003",
    operatorName: "Lanka Ashok Leyland",
    busType: "Express",
    capacity: 53,
    assignedRoutes: ["RT001", "RT004"],
    gpsDeviceId: "GPS_BUS020_001",
    status: "active"
  },
  {
    busId: "BUS021",
    registrationNumber: "WP-LAL-0099", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV003",
    operatorName: "Lanka Ashok Leyland",
    busType: "Semi-Luxury",
    capacity: 47,
    assignedRoutes: ["RT006", "RT007"],
    gpsDeviceId: "GPS_BUS021_001",
    status: "active"
  },
  {
    busId: "BUS022",
    registrationNumber: "WP-LAL-1100", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV003",
    operatorName: "Lanka Ashok Leyland",
    busType: "Normal",
    capacity: 60,
    assignedRoutes: ["RT008", "RT001"],
    gpsDeviceId: "GPS_BUS022_001",
    status: "active"
  },

  // Private Operator: Wayamba Transport (BUS023-BUS025)
  {
    busId: "BUS023",
    registrationNumber: "NW-WAY-3322", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV004",
    operatorName: "Wayamba Transport Service",
    busType: "Express",
    capacity: 51,
    assignedRoutes: ["RT004", "RT006"],
    gpsDeviceId: "GPS_BUS023_001",
    status: "active"
  },
  {
    busId: "BUS024",
    registrationNumber: "NW-WAY-5544", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV004",
    operatorName: "Wayamba Transport Service",
    busType: "Semi-Luxury",
    capacity: 46,
    assignedRoutes: ["RT005", "RT007"],
    gpsDeviceId: "GPS_BUS024_001",
    status: "active"
  },
  {
    busId: "BUS025",
    registrationNumber: "NW-WAY-7766", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV004",
    operatorName: "Wayamba Transport Service",
    busType: "A/C Express",
    capacity: 43,
    assignedRoutes: ["RT004", "RT005"],
    gpsDeviceId: "GPS_BUS025_001",
    status: "active"
  },

  // Private Operator: North Central Express (BUS026-BUS028)
  {
    busId: "BUS026",
    registrationNumber: "NC-NCE-9988", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV005",
    operatorName: "North Central Express",
    busType: "Luxury",
    capacity: 39,
    assignedRoutes: ["RT006", "RT004"],
    gpsDeviceId: "GPS_BUS026_001",
    status: "active"
  },
  {
    busId: "BUS027",
    registrationNumber: "NC-NCE-1010", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV005",
    operatorName: "North Central Express",
    busType: "Semi-Luxury",
    capacity: 48,
    assignedRoutes: ["RT007", "RT008"],
    gpsDeviceId: "GPS_BUS027_001",
    status: "active"
  },
  {
    busId: "BUS028",
    registrationNumber: "NC-NCE-2020", // ✅ EXACT MATCH FROM API
    operatorId: "PRIV005",
    operatorName: "North Central Express",
    busType: "Express",
    capacity: 55,
    assignedRoutes: ["RT003", "RT005"],
    gpsDeviceId: "GPS_BUS028_001",
    status: "active"
  }
];

export default buses;