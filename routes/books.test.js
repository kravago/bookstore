const request = require('supertest');
const { response } = require('../app');
const app = require('../app');
const db = require('../db');
const ExpressError = require('../expressError');

process.env.NODE_ENV = 'test';

let book_isbn;

beforeEach(async () => {
    const res = await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES ('0691161518', 'http://a.co/eobPtX2', 'test author', 'english', 264, 'test publisher', 'test title', 2017)
        RETURNING isbn`);
    book_isbn = res.rows[0].isbn;    
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
describe('GET /books/:id', () => {
    test('works', async () => {
        const res = await request(app).get(`/books/${book_isbn}`)
        expect(res.body.book.isbn).toBe(book_isbn);
    });
});

// POST /books
describe('POST /books', () => {
    test('works: creates book', async () => {
        const newBook = {isbn: '1234567890',
            amazon_url: 'http://test.com',
            author: 'another test author',
            language: 'english',
            pages: 111,
            publisher: 'testing publisher',
            title: 'test 2',
            year: 1999       
        }
        const res = await request(app).post('/books').send(newBook);
        expect(res.statusCode).toBe(201);
        expect(res.body.book).toHaveProperty('isbn');

    });

    test('book with missing fields is not inserted', async () => {
        const new_book = { author: 'mystery man', title: 'the biggest mystery'};
        const res = await request(app).post('/books').send(new_book);
        expect(res.statusCode).toBe(400);
    });
})

// PUT /books
describe('PUT /books/:id', () => {
    test('works: updates title to "NEW TITLE"', async () => {
        const res = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: 'http://a.co/eobPtX2',
                author: 'test author',
                language: 'english',
                pages: 264, 
                publisher: 'test publisher',
                title: 'NEW TITLE',
                year: 2017
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.book.title).toBe('NEW TITLE');
    })
});

// DELETE /books
describe('DELETE /books/:id', () => {
    test('works: deleting a book', async () => {
        const res = await request(app).delete(`/books/${book_isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Book deleted');
    })
})

