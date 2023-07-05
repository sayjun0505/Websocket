import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const TodoApp = lazy(() => import('./TodoApp'));

const TodoAppConfig = {
  settings: {
    layout: {},
  },
  routes: [
    {
      path: 'apps/todo',
      element: <TodoApp />,
      children: [
        {
          path: '',
          element: <Navigate to="/apps/todo/all" />,
        },
        {
          path: 'all',
          element: <TodoApp />,
        },
        {
          path: ':filter/:label/:todoId?',
          element: <TodoApp />,
        },
        {
          path: ':filter/:todoId?',
          element: <TodoApp />,
        },
      ],
    },
  ],
};

export default TodoAppConfig;
