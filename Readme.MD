# TASKO

project-management-app/
├── backend/
│ ├── config/
│ │ ├── cloudinary.js <-- NEW: Cloudinary configuration file
│ │ └── db.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── projectController.js
│ │ ├── reportController.js
│ │ ├── taskController.js
│ │ ├── userController.js
│ │ └── notificationController.js <-- Notification controller
│ ├── middlewares/
│ │ ├── authMiddleware.js
│ │ └── errorMiddleware.js
│ ├── models/
│ │ ├── Notification.js <-- Notification model
│ │ ├── Project.js
│ │ ├── Task.js
│ │ └── User.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── projectRoutes.js
│ │ ├── reportRoutes.js
│ │ ├── taskRoutes.js
│ │ ├── userRoutes.js
│ │ └── notificationRoutes.js <-- Notification routes
│ ├── tests/
│ │ ├── auth.test.js
│ │ ├── controllers/
│ │ │ └── taskController.test.js
│ │ └── task.test.js
│ ├── utils/
│ │ └── jwt.js
│ ├── server.js
│ ├── package.json
│ ├── .env <-- Includes Cloudinary ENV vars
│ └── .gitignore
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── App.js
│ │ ├── assets/ <-- Potential directory for local images/icons (e.g., default avatar)
│ │ ├── components/
│ │ │ ├── CreateProjectForm.js
│ │ │ ├── CreateTaskForm.js
│ │ │ ├── EditProjectForm.js
│ │ │ ├── EditTaskForm.js
│ │ │ ├── Layout.js <-- Assumed wrapper component for PrivateRoute content
│ │ │ ├── Navbar.js
│ │ │ ├── NotificationDropdown.js
│ │ │ ├── NotificationItem.js
│ │ │ ├── PrivateRoute.js <-- Assumed component for protected routes
│ │ │ ├── ProgressBar.js
│ │ │ ├── Sidebar.js
│ │ │ ├── TaskItem.js
│ │ │ └── TaskList.js
│ │ ├── hooks/
│ │ │ └── useSocket.js
│ │ ├── pages/
│ │ │ ├── AuthPage.js
│ │ │ ├── HomePage.js
│ │ │ ├── NotFoundPage.js
│ │ │ ├── projects/
│ │ │ │ ├── EditProjectPage.js
│ │ │ │ ├── ProjectDetailsPage.js
│ │ │ │ └── ProjectsPage.js <-- List all projects
│ │ │ ├── reports/
│ │ │ │ ├── ProjectCompletionRatePage.js
│ │ │ │ ├── TasksCompletedReportPage.js
│ │ │ │ └── TeamWorkloadReportPage.js
│ │ │ ├── tasks/
│ │ │ │ ├── TaskDetailsPage.js
│ │ │ │ └── TasksPage.js <-- List all tasks (or user's tasks)
│ │ │ ├── UserProfilePage.js <-- For updating user profile including image
│ │ │ └── UsersPage.js <-- Admin/manager to view/manage users
│ │ ├── services/
│ │ │ ├── api.js <-- Centralized Axios instance
│ │ │ └── cloudinaryService.js <-- NEW: Frontend Cloudinary direct upload (if used)
│ │ ├── store/
│ │ │ ├── authSlice.js
│ │ │ └── index.js <-- Combines reducers and configures store
│ │ ├── styles/ <-- Common CSS or Tailwind config
│ │ │ └── index.css
│ │ ├── **tests**/
│ │ │ └── components/
│ │ │ └── ProgressBar.test.js
│ │ ├── index.js
│ │ └── reportWebVitals.js
│ ├── .env <-- Includes Cloudinary ENV vars (if frontend direct upload)
│ ├── .gitignore
│ └── package.json
└── README.md
