import { lazy } from 'react';
import { authRoles } from '../../../auth';

const Replies = lazy(() => import('./replies/Replies'));
const Reply = lazy(() => import('./reply/Reply'));

const RepliesSettingConfigs = {
  settings: {
    layout: {
      config: {},
    },
  },

  auth: authRoles.user,
  routes: [
    // {
    //   path: '/settings/replies/:replyId',
    //   element: <Reply />,
    // },
    {
      // path: '/settings/replies',
      element: <Replies />,
    },
    {
      // path: '/settings/replies/:id/edit',
      element: <Reply />,
    },
  ],
};

export default RepliesSettingConfigs;
