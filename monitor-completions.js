// Monitor route completions in real-time
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/locations');
    const data = await response.json();
    
    console.clear();
    console.log('📊 Real-time Route Progress Monitor');
    console.log('='.repeat(50));
    
    if (data.success && data.data) {
      // Group by route and show progress
      const routeStats = {};
      
      data.data.forEach(bus => {
        const routeId = bus.routeId;
        if (!routeStats[routeId]) {
          routeStats[routeId] = {
            name: bus.routeName,
            buses: []
          };
        }
        
        routeStats[routeId].buses.push({
          busId: bus.busId,
          progress: bus.routeProgress.progressPercentage,
          waypoint: `${bus.routeProgress.completedWaypoints}/${bus.routeProgress.totalWaypoints}`,
          city: bus.locationData.city
        });
      });
      
      // Display route progress
      Object.keys(routeStats).forEach(routeId => {
        const route = routeStats[routeId];
        console.log(`\n🚍 ${route.name} (${routeId}):`);
        
        route.buses.forEach(bus => {
          const progressBar = '█'.repeat(Math.floor(bus.progress / 10)) + '░'.repeat(10 - Math.floor(bus.progress / 10));
          const status = bus.progress >= 100 ? '🏁 COMPLETED!' : bus.progress > 80 ? '🔥 Near End' : '🚶 Progressing';
          
          console.log(`  ${bus.busId}: [${progressBar}] ${bus.progress}% (${bus.waypoint}) ${status} - ${bus.city}`);
        });
      });
      
      // Show completion candidates
      const nearCompletion = data.data.filter(bus => bus.routeProgress.progressPercentage > 80);
      if (nearCompletion.length > 0) {
        console.log(`\n🎯 Buses Close to Completion (80%+):`);
        nearCompletion.forEach(bus => {
          console.log(`  🚀 ${bus.busId} on ${bus.routeId}: ${bus.routeProgress.progressPercentage}% complete`);
        });
      }
    }
    
    console.log(`\n⏰ Last Updated: ${new Date().toLocaleTimeString()}`);
    console.log('🔄 Monitoring every 5 seconds...\n');
    
  } catch (error) {
    console.error('❌ Monitoring error:', error.message);
  }
}, 5000);

console.log('🔍 Starting Route Completion Monitor...');
console.log('Press Ctrl+C to stop monitoring\n');