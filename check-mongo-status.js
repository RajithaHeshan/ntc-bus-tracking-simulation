import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://heshan:8QZhO5QxO46NHXHH@cluster0.un975.mongodb.net/', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

async function checkCollections() {
  try {
    await client.connect();
    const db = client.db('srilankabuslink');
    
    const liveCount = await db.collection('livelocations').countDocuments();
    const completeCount = await db.collection('livelocationcompletes').countDocuments();
    
    console.log('📊 MongoDB Collection Status:');
    console.log('🔴 Live Locations:', liveCount);
    console.log('✅ Completed Routes:', completeCount);
    
    // Show a few recent live locations
    const recentLive = await db.collection('livelocations').find().sort({timestamp: -1}).limit(3).toArray();
    console.log('\n📍 Recent Live Updates:');
    recentLive.forEach((doc, i) => {
      console.log(`${i+1}. Bus ${doc.busId} at ${doc.locationData?.city || 'Unknown'} - ${new Date(doc.timestamp).toLocaleTimeString()}`);
    });
    
    // Show recent completions if any
    const recentComplete = await db.collection('livelocationcompletes').find().sort({journeyEndTime: -1}).limit(3).toArray();
    console.log('\n🏁 Recent Completions:');
    if (recentComplete.length > 0) {
      recentComplete.forEach((doc, i) => {
        console.log(`${i+1}. Bus ${doc.busId} completed ${doc.routeName} - ${doc.totalJourneyDuration}min`);
      });
    } else {
      console.log('   No route completions yet...');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkCollections();