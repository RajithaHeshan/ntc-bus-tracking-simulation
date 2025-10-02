/**
 * Test API Endpoint Directly
 * Send a location payload to see the exact error response
 */

import axios from 'axios';

const testLocationData = {
  "locationId": "LOC_BUS001_TEST",
  "tripId": "TRIP_BUS001_TEST",
  "busId": "BUS001",
  "routeId": "RT001",
  "routeName": "Colombo - Kandy Express",
  "registrationNumber": "WP-CAB-1234", // ✅ ADD MISSING FIELD
  "gpsDeviceId": "GPS_BUS001_001",
  "coordinates": {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "accuracy": 15.0,
    "altitude": 8.5
  },
  "movement": {
    "speed": 45.3,
    "heading": 87,
    "isMoving": true
  },
  "locationData": {
    "address": "123, Galle Face Green Road",
    "city": "Colombo",
    "nearestLandmark": "Galle Face Green",
    "roadName": "Colombo-Kandy Road (A1)"
  },
  "signalStrength": "good",
  "batteryLevel": 87,
  "timestamp": new Date().toISOString(),
  "serverTimestamp": new Date().toISOString(),
  "isValid": true,
  "alerts": {
    "speedingAlert": false,
    "routeDeviationAlert": false,
    "emergencyAlert": false,
    "maintenanceAlert": false
  }
};

async function testAPI() {
  try {
    console.log('🧪 Testing API Endpoint Directly\n');
    console.log('📤 Sending payload to: http://localhost:3000/api/locations');
    console.log('📦 Payload:', JSON.stringify(testLocationData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/locations', testLocationData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ Success Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Error Response:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.message);
    
    if (error.response?.data) {
      console.log('\n📋 Detailed Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.headers) {
      console.log('\n📬 Response Headers:');
      console.log(JSON.stringify(error.response.headers, null, 2));
    }
  }
}

testAPI();