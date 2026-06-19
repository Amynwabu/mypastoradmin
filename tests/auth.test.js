/**
 * Auth & role-gate tests.
 * Run with: npm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

// Use demo account seeded in seedService
const PASTOR = { email: 'pastor@example.com', password: 'ChangeMe123!' };

let pastorToken = '';

beforeAll(async () => {
  const res = await request(app).post('/api/auth/login').send(PASTOR);
  pastorToken = res.body.token;
});

// ── Health ────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ── Auth ─────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(PASTOR);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ ...PASTOR, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'x' });
    expect(res.status).toBe(401);
  });
});

// ── Unauthenticated requests → 401 ───────────────────────────────────────
const protectedRoutes = [
  ['GET',  '/api/members'],
  ['GET',  '/api/events'],
  ['GET',  '/api/prayer'],
  ['GET',  '/api/messages'],
  ['GET',  '/api/care'],
  ['GET',  '/api/finance'],
  ['GET',  '/api/evangelism'],
  ['GET',  '/api/analytics'],
  ['GET',  '/api/settings'],
];

describe('Unauthenticated requests', () => {
  for (const [method, path] of protectedRoutes) {
    it(`${method} ${path} → 401 without token`, async () => {
      const res = await request(app)[method.toLowerCase()](path);
      expect(res.status).toBe(401);
    });
  }
});

// ── Authenticated pastor can access all core routes ───────────────────────
describe('Pastor role — read access', () => {
  for (const [, path] of protectedRoutes) {
    it(`GET ${path} → 200 with pastor token`, async () => {
      const res = await request(app).get(path).set('Authorization', `Bearer ${pastorToken}`);
      expect(res.status).toBe(200);
    });
  }
});

// ── Members CRUD ──────────────────────────────────────────────────────────
describe('Members', () => {
  let createdId = '';

  it('pastor can create a member', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${pastorToken}`)
      .send({ name: 'Test Member', phone: '+447700900001' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Member');
    createdId = res.body.id;
  });

  it('pastor can update a member', async () => {
    const res = await request(app)
      .put(`/api/members/${createdId}`)
      .set('Authorization', `Bearer ${pastorToken}`)
      .send({ department: 'Choir' });
    expect(res.status).toBe(200);
    expect(res.body.department).toBe('Choir');
  });

  it('pastor can delete a member', async () => {
    const res = await request(app)
      .delete(`/api/members/${createdId}`)
      .set('Authorization', `Bearer ${pastorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${pastorToken}`)
      .send({ phone: '+447700900002' });
    expect(res.status).toBe(400);
  });
});

// ── Token edge cases ──────────────────────────────────────────────────────
describe('Token validation', () => {
  it('rejects a malformed token (too few parts)', async () => {
    const res = await request(app).get('/api/members').set('Authorization', 'Bearer abc.def');
    expect(res.status).toBe(401);
  });

  it('rejects a token with a tampered signature', async () => {
    const parts = pastorToken.split('.');
    const tampered = `${parts[0]}.${parts[1]}.AAAAAAAAAAAAAAAA`;
    const res = await request(app).get('/api/members').set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  it('rejects a token with a different-length signature (timingSafeEqual guard)', async () => {
    const parts = pastorToken.split('.');
    const tampered = `${parts[0]}.${parts[1]}.short`;
    const res = await request(app).get('/api/members').set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });
});
