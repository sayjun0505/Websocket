import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';
import TeamView from './team/TeamView';
import TeamForm from './team/TeamForm';

const TeamsApp = lazy(() => import('./TeamsApp'));

const TeamsAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.admin,
  routes: [
    {
      path: 'apps/teams',
      element: <TeamsApp />,
      children: [
        {
          path: ':id',
          element: <TeamView />,
        },
        {
          path: ':id/edit',
          element: <TeamForm />,
        },
      ],
    },
  ],
};

export default TeamsAppConfig;
