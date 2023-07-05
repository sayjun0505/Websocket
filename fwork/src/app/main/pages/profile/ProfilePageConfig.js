import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';

const ProfilePage = lazy(() => import('./ProfilePage'));

const profilePageConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: '/pages/profile',
      element: <ProfilePage />,
    },
  ],
};

export default profilePageConfig;
