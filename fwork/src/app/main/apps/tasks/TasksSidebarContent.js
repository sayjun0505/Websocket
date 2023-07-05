import { Outlet } from 'react-router-dom';

const TasksSidebarContent = (props) => {
  return (
    <div className="flex flex-col flex-auto">
      <Outlet />
    </div>
  );
};

export default TasksSidebarContent;
