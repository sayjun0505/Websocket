import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';

const DashboardApp = lazy(() => import('./DashboardApp'));

const DashboardAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: '/apps/dashboard',
      element: <DashboardApp />,
    },
  ],
};

export default DashboardAppConfig;
