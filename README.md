# Document Management System

A lightweight web-based Document Management System that allows users to manage their documents locally with features such as adding, searching, viewing, and deleting documents.

---

## Features

- **Add Documents**: Upload document metadata (name, description, and optional image).
- **Search Functionality**: Filter documents by name in real-time.
- **View Documents**: Preview document details and associated images in a modal.
- **Delete Documents**: Remove unwanted documents from the system.
- **Local Storage Persistence**: All data is stored locally in the browser.

---

## Technologies Used

- **React**: Component-based UI development.
- **TypeScript**: Static typing for better maintainability.
- **LocalStorage**: Data persistence without a backend.
- **React-Toastify**: User-friendly notifications.

---

## Installation and Setup

### Prerequisites
- Node.js installed on your system.
- A package manager like npm or yarn.

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/rk11machaba/documents-management.git
    cd documents-management-system
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## Project Structure

```plaintext
.
├── components
│   ├── add_document.tsx     # Component to add new documents
│   ├── documents.tsx       # Component to list, search, and manage documents
├── public                 # Static assets like images
├── package.json           # Project configuration and dependencies
└── README.md              # Project documentation
