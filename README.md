# Google Drive Clone

A full-stack file storage and management application that replicates core Google Drive functionality. Built with React frontend and Node.js backend.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **File Upload**: Drag and drop file upload with support for multiple files
- **File Management**: View, download, delete, and rename files
- **Folder Organization**: Create folders and organize files hierarchically
- **Search**: Quick search through files and folders
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### User Interface
- **Modern Design**: Clean, intuitive interface inspired by Google Drive
- **Grid/List Views**: Toggle between different file display modes
- **Real-time Feedback**: Toast notifications for all user actions
- **Drag & Drop**: Intuitive file upload experience
- **File Icons**: Visual file type recognition

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Dropzone**: File upload interface
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Notification system

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Multer**: File upload middleware
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

## 📁 Project Structure

```
gdrive/
├── frontend/                # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── middleware/         # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── uploads/           # File storage
│   └── package.json
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd gdrive
```

2. **Set up the backend**:
```bash
cd backend
npm install
```

3. **Configure environment variables**:
Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-here-please-change-this
UPLOAD_DIR=uploads
NODE_ENV=development
```

4. **Start the backend server**:
```bash
npm run dev
```

5. **Set up the frontend** (in a new terminal):
```bash
cd frontend
npm install
npm start
```

6. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register with email, name, and password
2. Passwords are hashed using bcrypt
3. JWT tokens are issued upon successful login
4. Tokens are stored in localStorage and included in API requests
5. Tokens expire after 7 days

## 📂 File Management

### Upload
- Drag and drop files anywhere in the dashboard
- Click "Upload Files" button to select files
- Multiple file upload support
- 100MB file size limit

### Organization
- Create folders to organize files
- Navigate through folder hierarchy
- Files are isolated per user account

### Operations
- Download files with original filenames
- Delete files and folders
- Rename files and folders
- Search through all files and folders

## 🔒 Security Features

- **User Isolation**: Users can only access their own files
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are never stored in plain text
- **File Validation**: Server-side file validation
- **CORS Protection**: Configured cross-origin policies

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your static hosting service
3. Update API URL environment variable if needed

### Recommended Hosting
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: For production, replace in-memory storage with MongoDB or PostgreSQL

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start    # React development server with hot reload
```

### API Testing
Use tools like Postman or curl to test API endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/files
- POST /api/files/upload

## 📊 Data Storage

**Current Implementation**: In-memory storage (for development)
**Production Ready**: Replace with database solutions like:
- MongoDB with Mongoose
- PostgreSQL with Sequelize
- MySQL with Prisma

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- File storage is in-memory (resets on server restart)
- No file sharing between users
- No file versioning
- Limited file preview capabilities

## 🚧 Future Enhancements

- Database integration
- File sharing and permissions
- File preview for images and documents
- Real-time collaboration
- File versioning and history
- Trash/recycle bin functionality
- Advanced search and filtering
- File compression and optimization

## 📞 Support

If you encounter any issues or have questions, please create an issue in the GitHub repository.
