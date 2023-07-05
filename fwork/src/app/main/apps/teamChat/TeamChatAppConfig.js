import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';
import Channel from './channel/Channel';
import DirectMessage from './directMessage/DirectMessage';
import HQ from './hq/HQ';
import TeamChatFirstScreen from './TeamChatFirstScreen';

const TeamChatApp = lazy(() => import('./TeamChatApp'));

const TeamChatAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: 'apps/teamchat',
      element: <TeamChatApp />,
      children: [
        {
          path: '',
          element: <TeamChatFirstScreen />,
        },
        {
          path: 'hq',
          element: <HQ />,
        },
        {
          path: ':channelId',
          element: <Channel />,
        },
        {
          path: 'dm/:contactId',
          element: <DirectMessage />,
        },
      ],
    },
  ],
};

export default TeamChatAppConfig;
