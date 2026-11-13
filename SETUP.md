# 🚀 TaskDrive – Setup Guide

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PriyadharshiniSB/taskdrive.git
cd taskdrive
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/driveclone
JWT_SECRET=your_secret_here
UPLOAD_DIR=uploads
```

Make sure MongoDB is running before starting the backend.

### 4. Start the Backend

```bash
npm run dev
```

### 5. Frontend Setup

Open a new terminal from the project root:

```bash
cd frontend
npm install
npm start
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001

## Features

- User Registration and Login
- JWT Authentication
- File Upload and Download
- Drag-and-Drop File Upload
- Folder Creation and Navigation
- File and Folder Management
- Search Functionality
- Responsive User Interface
- Activity History
- File Sharing

## Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router
- Axios
- React Dropzone
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- JWT Authentication
- bcryptjs

## Deployment

The application can be deployed using platforms such as:

- **Backend:** Railway or Render
- **Frontend:** Vercel or Netlify

Deployment requires configuring environment variables and updating the backend API URL and CORS settings.

---

**Note:** TaskDrive is a full-stack learning project developed to explore file management, authentication, and MERN stack development.
