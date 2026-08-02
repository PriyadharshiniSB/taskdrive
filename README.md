# TaskDrive

A full-stack Google Drive clone built with the MERN stack. Upload, organize, share, and manage files and folders, with a recycle bin, activity history, and user profiles — plus a lightweight built-in to-do list.

## Features

### Authentication
- Register / Login / Logout with JWT-based sessions
- Session persists across page refreshes
- Change password (requires current password confirmation)
- Profile picture upload

### Core Drive
- Upload files via drag-and-drop or file picker, with live per-file progress bars
- Client-side upload size guard (rejects files over 100MB before attempting upload)
- Create nested folders with breadcrumb navigation
- Grid and list view modes
- Search, sort (name/date/size/type), and category filters (images/documents/videos/audio/archives)
- Folder color-coding
- Inline rename for files and folders
- File details panel (size, type, created/modified dates)
- Storage usage meter

### Trash (Soft Delete)
- Deleting moves items to Trash instead of permanently removing them
- Deleting a folder recursively trashes everything inside it
- Restore individual items from Trash
- Permanently delete individual items or empty the entire Trash
- Search within Trash

### Sharing
- Share individual files or entire folders via a public link
- Toggle sharing on/off per item; toggling off immediately revokes the link
- Public share page works for logged-out visitors, no account required
- Image files show a live thumbnail preview on the share page
- Shared folders list their contents (one level deep) with individual downloads

### Profile
- Edit display name and email
- Upload/change profile picture
- Change password

### Activity History
- Logs uploads, deletes, restores, permanent deletes, renames, shares, and unshares
- Relative timestamps ("5m ago", "2h ago")
- Paginated (20 entries per page)
- Clear activity history

### Extras
- Dark mode with persisted preference
- Custom TaskDrive logo
- Built-in Todos tab

## Tech Stack

**Frontend:** React, React Router, Tailwind CSS, Axios, react-dropzone, react-hot-toast, lucide-react

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, fs-extra

## Project Structure

```
google-drive-clone/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── File.js               # File + Folder schemas and queries
│   │   ├── User.js               # User schema, auth, profile logic
│   │   └── Activity.js           # Activity log schema and queries
│   ├── routes/
│   │   ├── auth.js               # Register, login, profile, password, avatar
│   │   ├── files.js              # Upload, download, rename, delete, share
│   │   ├── folders.js            # Folder CRUD, color, share
│   │   ├── public.js             # No-auth routes for public share links
│   │   ├── activity.js           # Activity history endpoints
│   │   └── todos.js              # Todo list endpoints
│   ├── scripts/
│   │   └── cleanupShareId.js     # One-off DB maintenance script
│   ├── uploads/                  # Uploaded files live here on disk
│   └── server.js                 # App entry point
└── frontend/
    └── src/
        ├── components/
        │   ├── Dashboard.js       # Main drive UI
        │   ├── ProfilePage.js     # Profile + password + avatar
        │   ├── ActivityPage.js    # Activity history view
        │   ├── SharedFilePage.js  # Public share landing page
        │   ├── Logo.js            # Custom SVG logo
        │   └── ...
        ├── contexts/
        │   └── AuthContext.js     # Global auth state
        ├── services/
        │   └── api.js             # All backend API calls
        └── App.js                 # Route definitions
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB (running locally or a connection URI)

### Setup

1. Clone the repository and install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Create a `.env` file inside `backend/` (see `.env.example`):
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/driveclone
   JWT_SECRET=your_secret_here
   UPLOAD_DIR=uploads
   ```

3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

4. Start the frontend (in a separate terminal):
   ```bash
   cd frontend
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

## API Overview

--------------------------------------------------------------------------------------
| Method |           Endpoint              |              Description                |
|--------|---------------------------------|-----------------------------------------|                                     
| POST   | `/api/auth/register`            | Create an account                       |
| POST   | `/api/auth/login`               | Log in, returns JWT                     |
| GET    | `/api/auth/me`                  | Get current user                        |
| PATCH  | `/api/auth/profile`             | Update name/email                       |
| PATCH  | `/api/auth/password`            | Change password                         |
| POST   | `/api/auth/avatar`              | Upload profile picture                  |
| GET    | `/api/files`                    | List files/folders in a directory       |
| POST   | `/api/files/upload`             | Upload a file                           |
| GET    | `/api/files/download/:id`       | Download a file                         |
| PATCH  | `/api/files/:id/rename`         | Rename a file                           |
| DELETE | `/api/files/:id`                | Move a file to Trash                    |
| PATCH  | `/api/files/:id/restore`        | Restore a file from Trash               |
| DELETE | `/api/files/:id/permanent`      | Permanently delete a file               |
| POST   | `/api/files/:id/share`          | Enable public sharing on a file         |
| DELETE | `/api/files/:id/share`          | Disable public sharing on a file        |
| GET    | `/api/public/:shareId`          | View a shared file's metadata (no auth) |
| GET    | `/api/public/:shareId/download` | Download a shared file (no auth)        |
| GET    | `/api/activity`                 | Get paginated activity history          |
| DELETE | `/api/activity`                 | Clear activity history                  |
-------------------------------------------------------------------------------------

*(Folder and Todo endpoints follow the same patterns as Files — see `routes/folders.js` and `routes/todos.js`.)*

## License

This project was built as an internship/learning project.