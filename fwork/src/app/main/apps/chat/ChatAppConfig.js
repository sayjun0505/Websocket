import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';
import Chat from './chat/Chat';
import ChatFirstScreen from './ChatFirstScreen';

const ChatApp = lazy(() => import('./ChatApp'));

const ChatAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: 'apps/chat',
      element: <ChatApp title="chat"/>,
      children: [
        {
          path: '',
          element: <ChatFirstScreen />,
        },
        {
          path: ':id',
          element: <Chat />,
        },
        {
          path: ':id/:mode',
          element: <Chat />,
        },
      ],
    },
  ],
};

export default ChatAppConfig;
