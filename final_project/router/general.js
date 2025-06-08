const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username format" });
    }

    // Check if user already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];

    for (let key in books) {
        if (books[key].author === author) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];

    for (let key in books) {
        if (books[key].title === title) {
            matchingBooks.push({ isbn: key, ...books[key] });
        }
    }

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
    }
});

// Task 10: Get list of all books using async/await with Axios
public_users.get('/books', function (req, res) {
    const get_books = new Promise((resolve, reject) => {
        resolve(res.send(JSON.stringify({ books }, null, 4)));
    });

    get_books.then(() => {
        console.log(" Promise for Task 10 resolved");
    }).catch((error) => {
        console.error(" Promise for Task 10 rejected", error);
    });
});

// TASK 11: Get book details based on ISBN using Promises
public_users.get('/books/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const get_book_isbn = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject('ISBN not found');
        }
    });

    get_book_isbn
        .then((book) => {
            console.log("Promise for Task 11 is resolved");
            return res.status(200).json(book);
        })
        .catch((error) => {
            console.log(error);
            return res.status(404).json({ message: error });
        });
});

// TASK 12: Get book details based on author using Promises
public_users.get('/books/author/:author', function (req, res) {
    const authorParam = req.params.author.toLowerCase();

    const get_books_author = new Promise((resolve, reject) => {
        let booksByAuthor = [];

        Object.keys(books).forEach((isbn) => {
            const book = books[isbn];
            if (book.author.toLowerCase() === authorParam) {
                booksByAuthor.push({
                    isbn: isbn,
                    title: book.title,
                    reviews: book.reviews
                });
            }
        });

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("The mentioned author does not exist");
        }
    });

    get_books_author
        .then((booksByAuthor) => {
            console.log(" Promise for Task 12 resolved");
            res.status(200).json(booksByAuthor);
        })
        .catch((error) => {
            console.log(error);
            res.status(404).json({ message: error });
        });
});

// TASK 13: Get all books based on title using Promises
public_users.get('/books/title/:title', function (req, res) {
    const titleParam = req.params.title.toLowerCase();

    const get_books_title = new Promise((resolve, reject) => {
        let booksByTitle = [];

        Object.keys(books).forEach((isbn) => {
            const book = books[isbn];
            if (book.title.toLowerCase() === titleParam) {
                booksByTitle.push({
                    isbn: isbn,
                    author: book.author,
                    reviews: book.reviews
                });
            }
        });

        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject("The mentioned title does not exist");
        }
    });

    get_books_title
        .then((booksByTitle) => {
            console.log("Promise for Task 13 resolved");
            res.status(200).json(booksByTitle);
        })
        .catch((error) => {
            console.log(error);
            res.status(404).json({ message: error });
        });
});


module.exports.general = public_users;
