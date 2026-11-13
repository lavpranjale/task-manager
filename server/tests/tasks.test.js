import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';

let mongo;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await connectDB();
  ({ default: app } = await import('../app.js'));
});

afterAll(async () => {
  await disconnectDB();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Tasks API', () => {
  it('creates a task with valid data', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write tests', description: 'API coverage' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.description).toBe('API coverage');
    expect(res.body.completed).toBe(false);
    expect(res.body._id).toBeTruthy();
  });

  it('rejects an empty title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  it('fetches all tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'One' });
    await request(app).post('/api/tasks').send({ title: 'Two' });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.title)).toEqual(expect.arrayContaining(['One', 'Two']));
  });

  it('updates task completed status', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Toggle me' });
    const id = created.body._id;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.title).toBe('Toggle me');
  });

  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Remove me' });
    const id = created.body._id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(200);

    const list = await request(app).get('/api/tasks');
    expect(list.body).toHaveLength(0);
  });

  it('returns 404 for a non-existing task', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();

    const update = await request(app)
      .put(`/api/tasks/${missingId}`)
      .send({ title: 'Nope' });
    expect(update.status).toBe(404);

    const del = await request(app).delete(`/api/tasks/${missingId}`);
    expect(del.status).toBe(404);
  });
});
