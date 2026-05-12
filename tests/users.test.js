/**
 * Integration tests for user_api endpoints.
 * Requires a running MySQL instance at 127.0.0.1:3306 (user: test, pass: test, db: chem).
 *
 * Known bugs tested/documented:
 *   - POST /createUser for a truly new user: after confirming user doesn't exist, the code
 *     calls Model.oneByWebSSOID again expecting Chemdw data — it gets undefined and throws.
 *     Only the "restore deleted user" path works.
 */

const request = require('supertest');
const app = require('../app');
const knex = require('knex')(require('../knexfile').development);

// Stable test user IDs unlikely to collide with real data
const WSSO_ALICE = 999001;
const WSSO_BOB   = 999002;
const WSSO_NEW   = 999003;

let aliceId;
let bobId;

beforeAll(async () => {
    await knex('users').whereIn('user_id', [WSSO_ALICE, WSSO_BOB, WSSO_NEW]).delete();

    [aliceId] = await knex('users').insert({
        user_id: WSSO_ALICE,
        name: 'Alice Test',
        email: 'alice@test.com',
        role: 'ADMIN',
        privileged_permission: true,
        is_deleted: false,
    });

    [bobId] = await knex('users').insert({
        user_id: WSSO_BOB,
        name: 'Bob Test',
        email: 'bob@test.com',
        role: 'USER',
        privileged_permission: false,
        is_deleted: false,
    });
});

afterAll(async () => {
    await knex('users').whereIn('user_id', [WSSO_ALICE, WSSO_BOB, WSSO_NEW]).delete();
    await knex.destroy();
});

// ---------------------------------------------------------------------------
// GET /users
// ---------------------------------------------------------------------------
describe('GET /users', () => {
    it('returns all active users as an array', async () => {
        const res = await request(app).get('/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const ids = res.body.map(u => u.user_id);
        expect(ids).toContain(WSSO_ALICE);
        expect(ids).toContain(WSSO_BOB);
    });
});

// ---------------------------------------------------------------------------
// GET /WebSSOUserInfo/:webssoId
// ---------------------------------------------------------------------------
describe('GET /WebSSOUserInfo/:webssoId', () => {
    it('returns the user when found', async () => {
        const res = await request(app).get(`/WebSSOUserInfo/${WSSO_ALICE}`);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            user_id: WSSO_ALICE,
            name: 'Alice Test',
            email: 'alice@test.com',
        });
    });

    it('returns null body when webssoId does not exist', async () => {
        const res = await request(app).get('/WebSSOUserInfo/0');
        expect(res.status).toBe(200);
        expect(res.body).toBeFalsy(); // res.json(undefined) sends an empty body
    });
});

// ---------------------------------------------------------------------------
// POST /userInfo  (upsert via WebSSO session data)
// ---------------------------------------------------------------------------
describe('POST /userInfo', () => {
    it('returns 400 when webssoId is missing', async () => {
        const res = await request(app)
            .post('/userInfo')
            .send({ name: 'No ID', email: 'noid@test.com' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
        const res = await request(app)
            .post('/userInfo')
            .send({ webssoId: WSSO_NEW, email: 'noname@test.com' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/userInfo')
            .send({ webssoId: WSSO_NEW, name: 'No Email' });
        expect(res.status).toBe(400);
    });

    it('creates a new GUEST user when they do not exist yet', async () => {
        const res = await request(app)
            .post('/userInfo')
            .send({ webssoId: WSSO_NEW, name: 'New User', email: 'new@test.com' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            user_id: WSSO_NEW,
            role: 'GUEST',
        });
        // clean up so later tests start clean
        await knex('users').where('user_id', WSSO_NEW).delete();
    });

    it('updates last_access_time and returns existing user', async () => {
        const before = Math.floor(Date.now() / 1000) - 1;
        const res = await request(app)
            .post('/userInfo')
            .send({ webssoId: WSSO_ALICE, name: 'Alice Test', email: 'alice@test.com' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ user_id: WSSO_ALICE });
        expect(res.body.last_access_time).toBeGreaterThan(before);
    });
});

// ---------------------------------------------------------------------------
// PUT /updateUser/:id
// ---------------------------------------------------------------------------
describe('PUT /updateUser/:id', () => {
    it('returns 400 when trying to update own account', async () => {
        const res = await request(app)
            .put(`/updateUser/${bobId}`)
            .send({ auth: { id: bobId }, update: { role: 'ADMIN' } });
        expect(res.status).toBe(400);
        expect(res.text).toMatch(/own account/i);
    });

    it('updates another user successfully', async () => {
        const res = await request(app)
            .put(`/updateUser/${bobId}`)
            .send({ auth: { id: aliceId }, update: { role: 'ADMIN' } });
        expect(res.status).toBe(200);

        // restore Bob's original role
        await knex('users').where('id', bobId).update({ role: 'USER' });
    });

    it('succeeds even with empty update patch (assert checks merged object, not patch)', async () => {
        const res = await request(app)
            .put(`/updateUser/${bobId}`)
            .send({ auth: { id: aliceId }, update: {} });
        expect(res.status).toBe(200);
    });
});

// ---------------------------------------------------------------------------
// PUT /updateColumnConfig
// ---------------------------------------------------------------------------
describe('PUT /updateColumnConfig', () => {
    it('returns 400 when id is missing', async () => {
        const res = await request(app)
            .put('/updateColumnConfig')
            .send({ colName: 'column_config', column_config: { colA: true } });
        expect(res.status).toBe(400);
    });

    it('updates column_config for a user', async () => {
        const config = { colA: true, colB: false };
        const res = await request(app)
            .put('/updateColumnConfig')
            .send({ id: aliceId, colName: 'column_config', column_config: config });
        expect(res.status).toBe(200);
    });

    it('updates similarity_column_config for a user', async () => {
        const config = { sim1: 0.8, sim2: 0.5 };
        const res = await request(app)
            .put('/updateColumnConfig')
            .send({ id: aliceId, colName: 'similarity_column_config', similarity_column_config: config });
        expect(res.status).toBe(200);
    });
});

// ---------------------------------------------------------------------------
// POST /createUser  (manual add)
// ---------------------------------------------------------------------------
describe('POST /createUser', () => {
    it('returns 400 when user with webssoId already exists', async () => {
        const res = await request(app)
            .post('/createUser')
            .send({ webssoId: WSSO_ALICE, role: 'USER' });
        expect(res.status).toBe(400);
        expect(res.text).toMatch(/already exists/i);
    });

    it('restores a soft-deleted user', async () => {
        // soft-delete Bob first
        await knex('users').where('id', bobId).update({ is_deleted: true, role: 'GUEST' });

        const res = await request(app)
            .post('/createUser')
            .send({ webssoId: WSSO_BOB, role: 'USER' });
        expect(res.status).toBe(200);
        expect(res.body[0]).toMatchObject({ is_deleted: 0, role: 'USER' });
    });

    // BUG: for a genuinely new webssoId the code does a second DB lookup expecting
    // Chemdw data, gets undefined, and throws TypeError. Documents the broken path.
    it('returns 400 for a new webssoId (chemdw integration path is broken)', async () => {
        const res = await request(app)
            .post('/createUser')
            .send({ webssoId: WSSO_NEW, role: 'USER' });
        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// DELETE /user/:id
// ---------------------------------------------------------------------------
describe('DELETE /user/:id', () => {
    it('returns 400 when trying to delete own account', async () => {
        const res = await request(app)
            .delete(`/user/${aliceId}`)
            .send({ auth: { id: aliceId } });
        expect(res.status).toBe(400);
        expect(res.text).toMatch(/yourself/i);
    });

    it('soft-deletes another user (sets is_deleted, role=GUEST, clears permissions)', async () => {
        const res = await request(app)
            .delete(`/user/${bobId}`)
            .send({ auth: { id: aliceId } });
        expect(res.status).toBe(200);
        expect(res.text).toMatch(/deleted successsfully/i);

        const bob = await knex('users').where('id', bobId).first();
        expect(bob.is_deleted).toBeTruthy();
        expect(bob.role).toBe('GUEST');
        expect(bob.privileged_permission).toBeFalsy();
    });
});
