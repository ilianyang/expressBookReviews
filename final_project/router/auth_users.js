const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = 'your_jwt_secret_key';

const isValid = (username) => typeof username === 'string' && username.trim().length >= 3;

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    if (!authenticatedUser(username, password))
        return res.status(401).json({ message: "Invalid username or password" });

    // Sign JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    // Save token & username in session (make sure express-session middleware is configured in main app)
    if (!req.session) req.session = {};
    req.session.authorization = { token, username };

    return res.status(200).json({ message: "User logged in successfully" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session?.authorization?.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!username)
        return res.status(401).json({ message: "User not logged in" });

    if (!review)
        return res.status(400).json({ message: "Review query parameter is required" });

    const book = books[isbn];
    if (!book)
        return res.status(404).json({ message: "Book not found" });

    if (!book.reviews) book.reviews = {};

    // Add or update review by this user
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review added/updated for ISBN ${isbn}`,
        reviews: book.reviews,
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session?.authorization?.username;
    const isbn = req.params.isbn;
  
    if (!username)
      return res.status(401).json({ message: "User not logged in" });
  
    const book = books[isbn];
    if (!book)
      return res.status(404).json({ message: "Book not found" });
  
    if (!book.reviews || !book.reviews[username])
      return res.status(404).json({ message: "Review by user not found" });
  
    // Delete only user's review
    delete book.reviews[username];
  
    return res.status(200).json({
      message: `Review deleted for ISBN ${isbn} by user ${username}`,
      reviews: book.reviews,
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
