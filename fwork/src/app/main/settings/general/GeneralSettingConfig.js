import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import authRoles from '../../../auth/authRoles';
import WorkingHoursSetting from './components/WorkingHoursSetting';
// import MotopressSetting from './components/MotopressSetting';
import NotificationSetting from './components/NotificationSetting';
import ProfilePage from '../../pages/profile/ProfilePage';
import UsersApp from '../../apps/users/UsersApp';
import TeamsApp from '../../apps/teams/TeamsApp';
import UserView from '../../apps/users/user/UserView';
import UserForm from '../../apps/users/user/UserForm';
import UserNew from '../../apps/users/user/UserNew';
import TeamView from '../../apps/teams/team/TeamView';
import TeamForm from '../../apps/teams/team/TeamForm';
import ChannelsSetting from '../channels/ChannelsSetting';
import NewChannel from '../channels/channel/NewChannel';
import ChannelLineForm from '../channels/channel/ChannelLineForm';
import ChannelView from '../channels/channel/ChannelView';
import ChannelFacebookForm from '../channels/channel/ChannelFacebookForm';
import ChannelInstagramForm from '../channels/channel/ChannelInstagramForm';
import Replies from '../replies/replies/Replies';
import Reply from '../replies/reply/Reply';
// import TeamForm from './team/TeamForm';

const GeneralSetting = lazy(() => import('./GeneralSetting'));

const GeneralSettingConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: '/settings',
      element: <GeneralSetting />,
      children: [
        {
          path: '',
          element: <Navigate to="profile" />,
        },
        {
          path: 'profile',
          element: <ProfilePage />,
        },
        {
          path: 'users',
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
        {
          path: 'teams',
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
        {
          path: 'channels',
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
        {
          path: 'notification',
          element: <NotificationSetting />,
        },
        {
          path: 'replies',
          element: <Replies />,
        },
        {
          path: 'replies/:id/edit',
          element: <Reply />,
        },
        {
          path: 'working-hours',
          element: <WorkingHoursSetting />,
        },
      ],
    },
  ],
};

export default GeneralSettingConfig;
