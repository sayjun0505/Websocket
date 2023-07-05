import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';

const Error404Page = lazy(() => import('./Error404Page'));
const Error500Page = lazy(() => import('./Error500Page'));

const errorPagesConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: '404',
      element: <Error404Page />,
    },
    {
      path: '500',
      element: <Error500Page />,
    },
  ],
};

export default errorPagesConfig;
