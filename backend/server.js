
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "10kb" }));

// Book database model
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

// Check whether a book ID is valid
function isValidBookId(id) {
  return mongoose.isValidObjectId(id);
}

// Escape special characters in search input
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Library Management API is running!" });
});

// Get all books and search
app.get("/api/books", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { author: { $regex: safeSearch, $options: "i" } },
        { category: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get books error:", error.message);
    res.status(500).json({ message: "Failed to retrieve books." });
  }
});

// Add a book
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, category } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof category !== "string" ||
      !title.trim() ||
      !author.trim() ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a title, author, and category.",
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Add book error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "The book information is invalid.",
      });
    }

    res.status(500).json({ message: "Failed to save book." });
  }
});

// Borrow or return a book
app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidBookId(id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    // Only allow these fields to be updated
    const updates = {};
    const allowedFields = ["title", "author", "category", "available"];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid update information provided.",
      });
    }

    // Validate text fields
    for (const field of ["title", "author", "category"]) {
      if (field in updates) {
        if (typeof updates[field] !== "string" || !updates[field].trim()) {
          return res.status(400).json({
            message: `${field} must be a non-empty text value.`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    // available must be a true or false value
    if ("available" in updates && typeof updates.available !== "boolean") {
      return res.status(400).json({
        message: "Availability must be true or false.",
      });
    }

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json(book);
  } catch (error) {
    console.error("Update book error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "The updated book information is invalid.",
      });
    }

    res.status(500).json({ message: "Could not update book." });
  }
});

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidBookId(id)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Delete book error:", error.message);
    res.status(500).json({ message: "Could not delete book." });
  }
});

// Handle invalid JSON and other request errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON in request body." });
  }

  console.error("Request error:", error.message);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the backend .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`Library API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
