import { lazy } from 'react';
// import { Navigate } from 'react-router-dom';
import authRoles from '../../../auth/authRoles';
// import WorkingHoursSetting from './components/WorkingHoursSetting';
// import MotopressSetting from './components/MotopressSetting';
import NewChannel from './channel/NewChannel';
import ChannelView from './channel/ChannelView';
import ChannelLineForm from './channel/ChannelLineForm';
import ChannelFacebookForm from './channel/ChannelFacebookForm';
import ChannelInstagramForm from './channel/ChannelInstagramForm';

const ChannelsSetting = lazy(() => import('./ChannelsSetting'));

const ChannelsSettingConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      // path: '/settings/channels',
      element: <ChannelsSetting />,
      children: [
        {
          path: 'new',
          element: <NewChannel />,
        },
        {
          path: 'line/:id',
          element: <ChannelLineForm />,
        },
        {
          path: 'facebook/:id',
          element: <ChannelView />,
        },
        {
          path: 'instagram/:id',
          element: <ChannelView />,
        },
        {
          path: 'line/:id/edit',
          element: <ChannelLineForm />,
        },
        {
          path: 'facebook/:id/edit',
          element: <ChannelFacebookForm />,
        },
        {
          path: 'instagram/:id/edit',
          element: <ChannelInstagramForm />,
        },
      ],
    },
  ],
};

export default ChannelsSettingConfig;
