const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { startServer, registerShutdown } = require('../server');

async function main() {
  const mongo = await MongoMemoryServer.create();
  try {
    const server = await startServer({ uri: mongo.getUri('product_db') });
    console.log('LOCAL DEMO: temporary MongoDB; data is removed when this process stops.');
    registerShutdown(server, () => mongo.stop());
  } catch (error) {
    await mongoose.disconnect();
    await mongo.stop();
    throw error;
  }
}

main().catch((error) => {
  console.error('Local demo failed (' + error.name + '). Check the MongoDB binary download and PORT.');
  process.exitCode = 1;
});
