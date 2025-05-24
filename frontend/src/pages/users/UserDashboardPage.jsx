import React from "react";
import TaskList from "../../components/tasks/TaskList";

const UserDashboardPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Your Tasks
      </h2>
      <TaskList />
      {/* You can add other user-specific widgets or information here */}
    </div>
  );
};

export default UserDashboardPage;
