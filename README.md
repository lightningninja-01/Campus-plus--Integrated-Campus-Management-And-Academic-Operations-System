# Campus+ - Integrated Campus Management and Academic Operations System

A comprehensive full-stack web application designed to streamline campus operations, academic management, and student engagement. Built with modern technologies, Campus+ provides a centralized platform for students, faculty, and administrators to manage courses, assignments, attendance, results, notices, and collaborative study groups.

## 🌟 Features

### For Students
- **Course Management**: Browse and enroll in courses relevant to their semester and branch
- **Assignment Tracking**: View and submit assignments with deadline tracking
- **Attendance Records**: Monitor personal attendance across courses
- **Results Viewing**: Access exam results and academic performance
- **Study Groups**: Create or join study groups for collaborative learning
- **Group Chat**: Real-time messaging within study groups using Socket.io
- **Notices**: Receive important announcements and updates

### For Faculty
- **Course Management**: Create and manage courses
- **Assignment Creation**: Design and publish assignments
- **Attendance Management**: Mark and track student attendance
- **Results Upload**: Upload and publish exam results
- **Notice Broadcasting**: Send announcements to students
- **Student Monitoring**: Track student progress and engagement

### For Administrators
- **User Management**: Create and manage staff (faculty and admin) accounts
- **Course Oversight**: Manage all courses across departments and semesters
- **System-wide Notices**: Create system announcements
- **User Activation**: Deactivate/activate user accounts as needed
- **Timetable Management**: Organize and publish class schedules

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB with Mongoose (v9.2.4)
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Real-time**: Socket.io (v4.8.3)
- **CORS**: Enabled for cross-origin requests
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React (v19.2.4)
- **Build Tool**: Vite (v8.0.0)
- **Routing**: React Router (v7.13.1)
- **HTTP Client**: Axios (v1.13.6)
- **Real-time**: Socket.io-client (v4.8.3)
- **Linting**: ESLint

### Deployment
- **Backend**: Render (https://campus-backend-gi92.onrender.com)
- **Frontend**: Vercel

## 📁 Project Structure

```
Campus+/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── config/
│   │   │   └── database.js        # MongoDB connection
│   │   ├── controllers/           # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── assignment.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── studygroup.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   ├── Assignment.js
│   │   │   ├── Attendance.js
│   │   │   ├── Result.js
│   │   │   ├── Notice.js
│   │   │   ├── StudyGroup.js
│   │   │   ├── Message.js
│   │   │   ├── Event.js
│   │   │   ├── Timetable.js
│   │   │   └── Ticket.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── assignment.routes.js
│   │   │   └── ...
│   │   └── utils/
│   │       └── generateToken.js
│   ├── server.js                  # Server entry point
│   ├── seedGroups.js              # Database seeding script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.js             # Axios instance
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── notices.js
│   │   │   ├── attendance.js
│   │   │   └── index.js           # API endpoints
│   │   ├── components/            # Reusable components
│   │   │   ├── NavBar.jsx
│   │   │   ├── SideBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TimetableBoard.jsx
│   │   │   └── CampusLogo.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── pages/                 # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudyGroups.jsx
│   │   │   └── GroupChat.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lightningninja-01/Campus-plus--Integrated-Campus-Management-And-Academic-Operations-System.git
   cd Campus+
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running Locally

**Terminal 1 - Backend Server**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend Development Server**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register a new student
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `GET /auth/users` - Get all users (admin only)
- `POST /auth/users` - Create staff account (admin only)

### Courses
- `GET /courses` - Get courses (filtered by user role)
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (admin only)
- `PUT /courses/:id` - Update course (admin only)
- `DELETE /courses/:id` - Delete course (admin only)
- `POST /courses/:id/enroll` - Enroll in course (student only)
- `POST /courses/:id/unenroll` - Unenroll from course (student only)

### Assignments
- `GET /assignments/my` - Get my assignments (student only)
- `GET /assignments/course/:courseId` - Get course assignments
- `POST /assignments` - Create assignment (faculty only)
- `POST /assignments/:id/submit` - Submit assignment (student only)

### Attendance
- `GET /attendance/my` - Get my attendance (student only)
- `POST /attendance/mark` - Mark attendance (faculty only)

### Results
- `GET /results/my` - Get my results (student only)
- `POST /results` - Upload results (admin/faculty only)

### Notices
- `GET /notices` - Get notices
- `POST /notices` - Create notice (admin only)

### Study Groups
- `GET /studygroups` - Get all study groups
- `POST /studygroups` - Create study group
- `POST /studygroups/:id/join` - Join study group
- `POST /studygroups/:id/leave` - Leave study group

### Messages (Real-time via Socket.io)
- `GET /messages/:groupId` - Get group messages

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000                              # Server port
MONGODB_URI=mongodb+srv://...          # MongoDB connection string
JWT_SECRET=your_secret_key             # JWT signing key
FRONTEND_URL=https://vercel-url.com    # Frontend deployment URL
```

### Frontend (.env)
```
VITE_API_URL=https://backend-url.com   # Backend API URL (no trailing slash)
```

## 🌐 Deployment

### Backend Deployment (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy!

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com`
3. Deploy!

### Important CORS Configuration
Ensure your backend CORS settings include your frontend domain:
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "https://your-vercel-domain.vercel.app"],
  credentials: true,
}));
```

## 🧪 Running Tests

Currently no automated tests configured. To add:
```bash
npm install --save-dev jest @testing-library/react
npm test
```

## 📚 Database Schema Overview

### User Model
- Email, password (hashed), name, role (student/faculty/admin)
- Student fields: semester, branch, section, rollNumber
- Faculty fields: department, designation
- Deactivation flag for account management

### Course Model
- Name, code, description, credits
- Faculty assignment, semester, branch
- Enrolled students tracking

### Assignment Model
- Title, description, due date
- Attached course, faculty creator
- Submissions tracking

### Attendance Model
- Date, course reference
- Student attendance status
- Marked by faculty

### StudyGroup Model
- Group name, description
- Member tracking
- Creation timestamp

## 🔄 Real-time Features (Socket.io)

The application uses Socket.io for real-time group chat and notifications:
- Join/leave study group connections
- Message broadcasting within groups
- Emoji reactions on messages
- Message pinning functionality

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📧 Support

For support, email: [support email]
Or open an issue on GitHub.

## 🎯 Future Enhancements

- [ ] Email notifications for assignments and notices
- [ ] Mobile app version (React Native)
- [ ] Advanced analytics dashboard
- [ ] Video conferencing integration
- [ ] Mobile SMS notifications
- [ ] Document management system
- [ ] GPA calculation and academic analytics

## 👥 Team

- **Developer**: Nishant
- **Repository**: [GitHub - Campus Plus](https://github.com/lightningninja-01/Campus-plus--Integrated-Campus-Management-And-Academic-Operations-System)

---

**Last Updated**: March 2026
**Current Version**: 1.0.0
