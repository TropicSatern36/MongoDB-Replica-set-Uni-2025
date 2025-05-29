const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/?replicaSet=myReplicaSet&directConnection=true';

let insertLatencies = [];
let readLatencies = [];

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db('testdatabase').collection('test');

    const operations = 50;
    const start = Date.now();

    for (let i = 0; i < operations; i++) {
      const insertStart = Date.now();
      await collection.insertOne({ index: i, value: `test${i}` });
      const insertEnd = Date.now();
      insertLatencies.push(insertEnd - insertStart);

      const readStart = Date.now();
      await collection.findOne({ index: i });
      const readEnd = Date.now();
      readLatencies.push(readEnd - readStart);
    }

    const end = Date.now();
    const totalTime = (end - start) / 1000;

    const avgInsertLatency = insertLatencies.reduce((a, b) => a + b) / insertLatencies.length;
    const avgReadLatency = readLatencies.reduce((a, b) => a + b) / readLatencies.length;
    const throughput = operations * 2 / totalTime;

    console.log(`Performed ${operations} operations in ${(end - start) / 1000} seconds`);
    console.log(`\n--- Performance Summary ---`);
    console.log(`Total operations: ${operations * 2}`);
    console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`Throughput: ${throughput.toFixed(2)} ops/sec`);
    console.log(`Average insert latency: ${avgInsertLatency.toFixed(2)} ms`);
    console.log(`Average read latency: ${avgReadLatency.toFixed(2)} ms`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
