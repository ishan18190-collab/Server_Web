const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startServer } = require('../server');
const Product = require('../models/product.model');

describe('Product API with an isolated real MongoDB instance', { timeout: 180000 }, () => {
  let mongo;
  let server;
  let baseUrl;
  let productId;
  const product = {
    name: 'Wireless Mouse', description: 'Bluetooth wireless mouse',
    price: 799, category: 'Electronics', inStock: true,
  };

  async function request(method, path, body, raw = false) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  before(async () => {
    // Never use the user's Atlas database for automated tests.
    mongo = await MongoMemoryServer.create();
    server = await startServer({ uri: mongo.getUri('server_web_test'), port: 0 });
    baseUrl = 'http://127.0.0.1:' + server.address().port;
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it('reports a healthy database', async () => {
    const result = await request('GET', '/api/health');
    assert.equal(result.status, 200);
    assert.equal(result.body.database, 'connected');
  });

  it('starts with an empty product list', async () => {
    const result = await request('GET', '/api/products');
    assert.equal(result.status, 200);
    assert.equal(result.body.count, 0);
    assert.deepEqual(result.body.data, []);
  });

  it('creates and persists a product with timestamps', async () => {
    const result = await request('POST', '/api/products', product);
    assert.equal(result.status, 201);
    productId = result.body.data._id;
    assert.match(productId, /^[a-f0-9]{24}$/);
    assert.ok(result.body.data.createdAt);
    assert.ok(result.body.data.updatedAt);
    assert.equal((await Product.findById(productId)).price, 799);
  });

  it('fetches the created product by ID', async () => {
    const result = await request('GET', '/api/products/' + productId);
    assert.equal(result.status, 200);
    assert.equal(result.body.data.name, product.name);
  });

  it('applies defaults, trims strings, and lists newest first', async () => {
    const result = await request('POST', '/api/products', {
      name: '  Notebook  ', description: '  Ruled pages  ', price: 0,
    });
    assert.equal(result.status, 201);
    assert.equal(result.body.data.name, 'Notebook');
    assert.equal(result.body.data.description, 'Ruled pages');
    assert.equal(result.body.data.category, 'General');
    assert.equal(result.body.data.inStock, true);
    const list = await request('GET', '/api/products');
    assert.equal(list.body.count, 2);
    assert.equal(list.body.data[0]._id, result.body.data._id);
    await request('DELETE', '/api/products/' + result.body.data._id);
  });

  it('updates supplied fields and preserves omitted fields', async () => {
    const result = await request('PUT', '/api/products/' + productId, { price: 699, inStock: false });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.price, 699);
    assert.equal(result.body.data.inStock, false);
    assert.equal(result.body.data.description, product.description);
    assert.equal((await Product.findById(productId)).price, 699);
  });

  for (const field of ['name', 'description', 'price']) {
    it('rejects missing required field: ' + field, async () => {
      const body = { ...product };
      delete body[field];
      assert.equal((await request('POST', '/api/products', body)).status, 400);
    });
  }

  for (const [label, fields] of [
    ['negative price', { price: -1 }],
    ['string price', { price: '799' }],
    ['boolean string', { inStock: 'false' }],
    ['null price', { price: null }],
    ['blank name', { name: '  ' }],
    ['short name', { name: 'A' }],
    ['long name', { name: 'A'.repeat(101) }],
    ['long description', { description: 'A'.repeat(501) }],
    ['blank category', { category: ' ' }],
  ]) {
    it('rejects ' + label, async () => {
      assert.equal((await request('POST', '/api/products', { ...product, ...fields })).status, 400);
    });
  }

  it('validates updates without changing saved data', async () => {
    assert.equal((await request('PUT', '/api/products/' + productId, { price: -1 })).status, 400);
    assert.equal((await Product.findById(productId)).price, 699);
  });

  for (const fields of [{ $set: { price: 1 } }, { _id: '000000000000000000000001' }, { createdAt: '2000-01-01' }]) {
    it('rejects an operator or read-only update: ' + Object.keys(fields)[0], async () => {
      assert.equal((await request('PUT', '/api/products/' + productId, fields)).status, 400);
    });
  }

  it('rejects missing, empty, array, and malformed bodies', async () => {
    for (const body of [undefined, {}, [], '[', 'null']) {
      const result = await request('POST', '/api/products', body, typeof body === 'string');
      assert.equal(result.status, 400);
      assert.equal(result.body.success, false);
    }
    assert.equal((await request('PUT', '/api/products/' + productId, {})).status, 400);
  });

  it('rejects oversized bodies', async () => {
    const result = await request('POST', '/api/products', { ...product, description: 'a'.repeat(110000) });
    assert.equal(result.status, 413);
  });

  for (const method of ['GET', 'PUT', 'DELETE']) {
    it('returns 400 for an invalid ID on ' + method, async () => {
      const result = await request(method, '/api/products/not-an-id', method === 'PUT' ? { price: 10 } : undefined);
      assert.equal(result.status, 400);
    });
    it('returns 404 for a missing product on ' + method, async () => {
      const result = await request(method, '/api/products/000000000000000000000001', method === 'PUT' ? { price: 10 } : undefined);
      assert.equal(result.status, 404);
    });
  }

  it('returns JSON for an unknown endpoint', async () => {
    const result = await request('GET', '/api/missing');
    assert.equal(result.status, 404);
    assert.equal(result.body.success, false);
  });

  it('deletes the product and confirms it is gone', async () => {
    const result = await request('DELETE', '/api/products/' + productId);
    assert.equal(result.status, 200);
    assert.equal(result.body.deletedId, productId);
    assert.equal(await Product.findById(productId), null);
    assert.equal((await request('GET', '/api/products/' + productId)).status, 404);
    assert.equal((await request('DELETE', '/api/products/' + productId)).status, 404);
  });

  it('reports 503 when the database disconnects', async () => {
    await mongoose.disconnect();
    const result = await request('GET', '/api/health');
    assert.equal(result.status, 503);
    assert.equal(result.body.success, false);
  });
});
