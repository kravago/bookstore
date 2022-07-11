const request = require('supertest');
const { response } = require('../app');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

beforeEach(async () => {
    await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('0691161518', 'http://a.co/eobPtX2', 'test author', 'english', 264, 'test publisher', 'test title', 2017)`)
});

afterEach(async () => {
    await db.query(`DELETE FROM books`);
});

afterAll(async () => {
    await db.end();
});

// GET /books
describe('GET /books', () => {
    test('works', async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body.books.length).toBe(1);
    });
});

// GET /books/:id

// POST /books

// PUT /books

// DELETE /books


