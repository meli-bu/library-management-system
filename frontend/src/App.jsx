
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
  });

  // Load books from MongoDB
  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await fetch("https://booknest-api-a5xg.onrender.com/api/books");

        if (!response.ok) {
          throw new Error("Failed to load books");
        }

        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error loading books:", error);
      }
    }

    loadBooks();
  }, []);

  // Get categories
  const categories = [
    "All",
    ...new Set(books.map((book) => book.category)),
  ];

  // Search and filter
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      `${book.title} ${book.author} ${book.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      book.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Add book with validation
  async function addBook(event) {
    event.preventDefault();

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();

    if (!title || !author || !category) {
      alert("Please fill in all fields.");
      return;
    }

    // Check for duplicate books
    const duplicate = books.some(
      (book) =>
        book.title.trim().toLowerCase() === title.toLowerCase() &&
        book.author.trim().toLowerCase() === author.toLowerCase()
    );

    if (duplicate) {
      alert("This book by this author already exists!");
      return;
    }

    try {
      const response = await fetch("https://booknest-api-a5xg.onrender.com/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, author, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save book");
      }

      setBooks((current) => [...current, data]);

      setForm({
        title: "",
        author: "",
        category: "",
      });

      setShowForm(false);
      alert("Book added successfully!");
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Could not save the book. Please try again.");
    }
  }

  // Borrow or return
  async function toggleAvailability(book) {
    try {
      const response = await fetch(
        `https://booknest-api-a5xg.onrender.com/api/books/${book._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            available: !book.available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update book");
      }

      const updatedBook = await response.json();

      setBooks((previousBooks) =>
        previousBooks.map((item) =>
          item._id === book._id ? updatedBook : item
        )
      );
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Could not update the book. Please try again.");
    }
  }

  // Delete book
  async function deleteBook(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://booknest-api-a5xg.onrender.com/api/books/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== id)
      );
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Could not delete the book. Please try again.");
    }
  }

  // Dashboard statistics
  const borrowedCount = books.filter(
    (book) => !book.available
  ).length;

  const availableCount = books.length - borrowedCount;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">📚 BookNest</div>

        <p className="side-label">MAIN MENU</p>

        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; Books</div>
        <div className="nav-item">↗ &nbsp; Borrowing</div>
        <div className="nav-item">⚙ &nbsp; Settings</div>

        <div className="sidebar-bottom">
          <div>📖 Library Management</div>
          <small>Organize knowledge.</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Library Dashboard</h1>
            <p>Manage your library collection in one place.</p>
          </div>

          <button
            className="primary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "+ Add New Book"}
          </button>
        </header>

        {/* Statistics */}
        <section className="stats">
          <div className="stat-card">
            <span>Total Books</span>
            <strong>{books.length}</strong>
            <small>Books in the collection</small>
          </div>

          <div className="stat-card">
            <span>Available Books</span>
            <strong>{availableCount}</strong>
            <small>Ready to borrow</small>
          </div>

          <div className="stat-card">
            <span>Borrowed Books</span>
            <strong>{borrowedCount}</strong>
            <small>Currently borrowed</small>
          </div>
        </section>

        {/* Add Book Form */}
        {showForm && (
          <form className="book-form" onSubmit={addBook}>
            <h2>Add a Book</h2>

            <input
              placeholder="Book title"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              required
            />

            <input
              placeholder="Author name"
              value={form.author}
              onChange={(event) =>
                setForm({ ...form, author: event.target.value })
              }
              required
            />

            <input
              placeholder="Category"
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              required
            />

            <button className="primary-btn" type="submit">
              Save Book
            </button>
          </form>
        )}

        {/* Book Collection */}
        <section className="books-section">
          <div className="section-heading">
            <div>
              <h2>Book Collection</h2>
              <p>View and manage your books.</p>
            </div>

            <input
              className="search"
              placeholder="Search books or authors..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="search"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BOOK TITLE</th>
                  <th>AUTHOR</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>

                    <td>
                      <span
                        className={`status ${
                          book.available ? "available" : "borrowed"
                        }`}
                      >
                        {book.available ? "Available" : "Borrowed"}
                      </span>
                    </td>

                    <td className="actions">
                      <button
                        onClick={() => toggleAvailability(book)}
                      >
                        {book.available ? "Borrow" : "Return"}
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteBook(book._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">
                      No books found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
