require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

async function startServer({ uri = process.env.MONGODB_URI, port = process.env.PORT || 5000 } = {}) {
  const portNumber = Number(port);
  if (!Number.isInteger(portNumber) || portNumber < 0 || portNumber > 65535) {
    throw new Error('PORT must be an integer between 0 and 65535.');
  }

  // Open the HTTP port only after MongoDB has connected.
  await connectDB(uri);
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(portNumber, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  console.log('Server running at http://localhost:' + server.address().port);
  console.log('Health: /api/health | Products: /api/products');
  return server;
}

function registerShutdown(server, cleanup = async () => {}) {
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => process.exit(1), 10000);
    timer.unref();
    try {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      await mongoose.disconnect();
      await cleanup();
      clearTimeout(timer);
    } catch {
      process.exitCode = 1;
    }
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (require.main === module) {
  startServer().then(registerShutdown).catch(async (error) => {
    console.error('Startup failed (' + error.name + '). Check .env, Atlas credentials, network access, and PORT.');
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = { startServer, registerShutdown };
