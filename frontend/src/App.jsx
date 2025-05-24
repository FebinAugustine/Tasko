import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManagerDashboardPage from "./pages/managers/ManagerDashboardPage";
import UserDashboardPage from "./pages/users/UserDashboardPage";
import TaskListPage from "./pages/tasks/TaskListPage";
import TaskDetailsPage from "./pages/tasks/TaskDetailsPage"; // Import TaskDetailsPage
import ProjectListPage from "./pages/projects/ProjectListPage";
import ProjectDetailsPage from "./pages/projects/ProjectDetailsPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import TeamListPage from "./pages/teams/TeamListPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const PrivateRoute = ({ children, roles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (roles && !roles.includes(user?.role)) {
      return <Navigate to="/unauthorized" />; // Create an Unauthorized page
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        <Route path="/" element={<AppLayout />}>
          <Route
            index
            element={
              <PrivateRoute>
                <UserDashboardPage />
              </PrivateRoute>
            }
          />{" "}
          {/* Default route for logged-in users */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <PrivateRoute roles={["manager"]}>
                <ManagerDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <PrivateRoute>
                <TaskDetailsPage />
              </PrivateRoute>
            }
          />{" "}
          {/* New route for task details */}
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <PrivateRoute roles={["manager"]}>
                <TeamListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PrivateRoute>
                <ProjectDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <PrivateRoute roles={["manager"]}>
                <CreateProjectPage />
              </PrivateRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />{" "}
          {/* Basic Unauthorized page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
