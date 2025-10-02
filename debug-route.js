/**
 * Simple test to check movement data
 */
import { buses } from './src/config/buses.js';
import routes from './src/config/routes.js';

console.log('📊 Debug Info:');
console.log('Buses length:', buses.length);
console.log('Routes length:', routes.length);
console.log('First bus:', buses[0]);
console.log('First route:', routes[0]);

const bus = buses[0];
const route = routes.find(r => r.routeId === bus.assignedRoutes[0]);
console.log('Found route:', route ? 'YES' : 'NO');

if (route) {
    console.log('Route name:', route.routeName);
}