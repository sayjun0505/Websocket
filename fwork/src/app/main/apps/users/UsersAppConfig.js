import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';
import UserView from './user/UserView';
import UserForm from './user/UserForm';
import UserNew from './user/UserNew';

const UsersApp = lazy(() => import('./UsersApp'));

const UsersAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: 'apps/users',
      element: <UsersApp />,
      children: [
        {
          path: ':id',
          element: <UserView />,
        },
        {
          path: ':id/edit',
          element: <UserForm />,
        },
        {
          path: 'new/edit',
          element: <UserNew />,
        },
      ],
    },
  ],
};

export default UsersAppConfig;
