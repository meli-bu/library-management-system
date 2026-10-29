# 📚 BookNest — Library Management System

BookNest is a full-stack web application designed to make managing a library's book collection easier. Users can add, view, search, filter, borrow, return, and delete books through a simple interface.

## ✨ Features

- Add new books
- View the complete book collection
- Search by title, author, or category
- Filter books by category
- Borrow and return books
- Delete books
- Save book records in MongoDB
- Validate user input and handle errors

## 🛠️ Technologies Used

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

## ⚙️ Installation and Setup

### Prerequisites

Install [Node.js](https://nodejs.org/) and prepare a MongoDB database.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd library-management-system
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL.

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder containing:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Replace the placeholder with your MongoDB connection string. Never upload your real `.env` file to GitHub.

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open a second terminal in the project's `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in your terminal, usually `http://localhost:5173`.

## 📁 Project Structure

```text
library-management-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## 🔐 Security

- Keep database credentials in environment variables.
- Do not commit `.env` files.
- Configure your database access and frontend URL before deployment.

## 👩‍💻 Author
Melat Biruk
Developed as a Software Engineering project.
