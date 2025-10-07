<<<<<<< HEAD
# Sri Lanka Bus GPS Data Simulator

A Node.js IoT device simulator that generates realistic GPS tracking data for Sri Lankan buses, sending location updates every 30 seconds to simulate real-world bus tracking systems.

## 🚍 Features

- **Real-time GPS Simulation**: Generates location data every 30 seconds
- **Multiple Routes**: Simulates at least 5 major Sri Lankan bus routes
- **Fleet Management**: Tracks 25+ buses across different operators
- **Realistic Movement**: Simulates bus speeds, stops, and route adherence
- **API Integration**: Sends data to external bus tracking APIs
- **IoT Device Emulation**: Acts as GPS devices with realistic signal variations
- **Route Visualization**: Includes GPS coordinates for major Sri Lankan routes

## 📁 Project Structure

```
sri-lanka-bus-gps-simulator/
├── src/
│   ├── config/
│   │   ├── routes.js          # Route definitions with GPS coordinates
│   │   ├── buses.js           # Bus fleet configuration
│   │   └── api-config.js      # API endpoint configuration
│   ├── core/
│   │   ├── gps-device.js      # GPS device simulation logic
│   │   ├── location-generator.js # GPS coordinate generation
│   │   └── movement-simulator.js # Bus movement simulation
│   ├── services/
│   │   ├── api-client.js      # HTTP client for API communication
│   │   └── data-logger.js     # Data logging and monitoring
│   ├── utils/
│   │   ├── coordinates.js     # GPS coordinate utilities
│   │   └── data-generator.js  # Sample data generation
│   ├── examples/
│   │   ├── single-bus-demo.js # Demo for single bus tracking
│   │   └── route-demo.js      # Demo for route visualization
│   └── simulator.js           # Main simulator application
├── data/
│   └── logs/                  # Generated GPS logs
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Configuration

Edit `.env` file with your API endpoint:

```env
API_BASE_URL=http://localhost:3000/api
UPDATE_INTERVAL=30000
LOG_LEVEL=info
```

### 3. Run the Simulator

```bash
# Start full simulator (all buses)
npm start

# Development mode with auto-reload
npm run dev

# Demo single bus
npm run single-bus

# Test API connection
npm run test-api
```

## 🗺️ Simulated Routes

The simulator includes these major Sri Lankan routes:

1. **RT001**: Colombo - Kandy Express (115km)
2. **RT002**: Colombo - Galle Southern Highway (119km)
3. **RT003**: Colombo - Matara Coastal Express (160km)
4. **RT004**: Colombo - Anuradhapura Ancient City Express (205km)
5. **RT005**: Kandy - Jaffna Northern Express (290km)
6. **RT006**: Colombo - Trincomalee Eastern Express (257km)
7. **RT007**: Colombo - Batticaloa Eastern Coast (314km)
8. **RT008**: Kandy - Nuwara Eliya Hill Country (78km)

## 🚌 Bus Fleet

- **28 Buses** across multiple operators
- Mix of government (SLTB) and private buses
- Various bus types: Express, Semi-luxury, Normal
- Realistic registration numbers and specifications

## 📊 Generated Data

Each GPS update includes:

```json
{
  "deviceId": "GPS_BUS001_001",
  "busId": "BUS001",
  "routeId": "RT001",
  "tripId": "TRIP_001",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "location": {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "accuracy": 15.2,
    "altitude": 8.5
  },
  "movement": {
    "speed": 45.3,
    "heading": 87.2,
    "isMoving": true
  },
  "deviceStatus": {
    "batteryLevel": 87,
    "signalStrength": "good"
  },
  "alerts": {
    "speedingAlert": false,
    "routeDeviationAlert": false
  }
}
```

## 🔧 API Integration

The simulator sends data to your bus tracking API:

- **POST** `/api/locations` - Live location updates
- **POST** `/api/trips/status` - Trip status updates
- **GET** `/api/health` - API health checks

## 🛠️ Development

### Running Examples

```bash
# Single bus demonstration
npm run single-bus

# Route visualization
npm run route-demo

# Test API connectivity
npm run test-api
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL of the tracking API | `http://localhost:3000/api` |
| `UPDATE_INTERVAL` | GPS update interval (ms) | `30000` |
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_BUSES` | Maximum buses to simulate | `28` |

## 📝 Logging

GPS data is logged to:
- Console output (real-time monitoring)
- `data/logs/gps-YYYY-MM-DD.json` (daily files)
- API response logs

## 🚦 Status Monitoring

Monitor the simulator:
- Real-time console output
- GPS coordinate accuracy
- API response times
- Device battery simulation
- Signal strength variations

## 🤝 Integration

To integrate with your main API:

1. Ensure your API has the `/api/locations` endpoint
2. Update `API_BASE_URL` in `.env`
3. Run the simulator with `npm start`
4. Monitor logs for successful data transmission

## 📋 Requirements Met

✅ **At least 5 routes**: 8 major Sri Lankan routes included  
✅ **25+ buses**: 28 buses across multiple operators  
✅ **30-second updates**: Configurable GPS update intervals  
✅ **Realistic data**: Based on actual Sri Lankan geography  
✅ **IoT simulation**: Acts as GPS devices with realistic variations  
✅ **API integration**: HTTP client for seamless data transmission

---

**Note**: This simulator is designed for development and testing purposes. For production use, ensure proper error handling and monitoring are in place.
=======
# ntc-bus-tracking-simulation
>>>>>>> 81825b0be99ef2506aef366b1ae71aef08752381
