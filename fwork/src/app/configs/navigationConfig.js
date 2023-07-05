import i18next from 'i18next';
import { authRoles } from '../auth';
import en from './navigation-i18n/en';
import th from './navigation-i18n/th';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('th', 'navigation', th);

const navigationConfig = [
  {
    id: 'apps',
    title: 'Applications',
    translate: 'APPLICATIONS',
    // subtitle: 'Custom made application designs',
    type: 'group',
    icon: 'heroicons-outline:home',
    children: [
      {
        id: 'apps.dashboard',
        title: 'Dashboard',
        translate: 'DASHBOARD',
        type: 'item',
        icon: 'heroicons-outline:clipboard-check',
        url: '/apps/dashboard',
        auth: authRoles.user,
      },
      {
        id: 'apps.chat',
        title: 'Inbox',
        translate: 'CHAT',
        type: 'item',
        icon: 'heroicons-outline:chat-alt',
        url: '/apps/chat',
        auth: authRoles.user,
      },
      {
        id: 'apps.customers',
        title: 'CRM',
        translate: 'CUSTOMERS',
        type: 'item',
        icon: 'heroicons-outline:user-group',
        url: '/apps/customers',
        auth: authRoles.user,
      },

      {
        id: 'apps.teamchat',
        title: 'Team Chat',
        translate: 'TEAMCHAT',
        type: 'item',
        icon: 'heroicons-outline:chat-alt-2',
        url: '/apps/teamChat',
        auth: authRoles.user,
      },
      {
        id: 'apps.scrumboard',
        title: 'Kanban Board',
        translate: 'KANBANBOARD',
        type: 'item',
        icon: 'heroicons-outline:view-boards',
        url: '/apps/kanbanboard',
        auth: authRoles.user,
      },
      {
        id: 'apps.tasks',
        title: 'TASKS',
        translate: 'TASKS',
        type: 'item',
        icon: 'heroicons-outline:check-circle',
        url: '/apps/tasks',
        auth: authRoles.user,
      },
      // {
      //   id: 'apps.todo',
      //   title: 'TODO',
      //   translate: 'TODO',
      //   type: 'item',
      //   icon: 'heroicons-outline:view-boards',
      //   url: '/apps/todo',
      //   auth: authRoles.user,
      // },
    ],
  },

  {
    id: 'divider-1',
    type: 'divider',
  },

  {
    id: 'directMessages',
    title: 'Direct Messages',
    type: 'collapse',
    icon: 'material-outline:add_comment',
    iconClass: 'scale-x-[-1]',
    auth: authRoles.user,
  },

  // {
  //   id: 'divider-2',
  //   type: 'divider',
  // },

  // {
  //   id: 'settings',
  //   title: 'Settings',
  //   translate: 'SETTINGS',
  //   // subtitle: 'Custom made application designs',
  //   type: 'group',
  //   icon: 'material-outline:settings_applications',
  //   children: [
  //     {
  //       id: 'general',
  //       title: 'General',
  //       translate: 'GENERAL',
  //       type: 'item',
  //       icon: 'material-outline:settings',
  //       url: '/settings/general',
  //       auth: authRoles.admin,
  //     },
  //     {
  //       id: 'channels',
  //       title: 'Channels',
  //       translate: 'CHANNELS',
  //       type: 'item',
  //       icon: 'material-outline:public',
  //       url: '/settings/channels',
  //       auth: authRoles.admin,
  //     },
  //     {
  //       id: 'profile',
  //       title: 'Profile',
  //       translate: 'PROFILE',
  //       type: 'item',
  //       icon: 'material-outline:account_circle',
  //       url: '/pages/profile',
  //       auth: authRoles.user,
  //     },
  //     {
  //       id: 'replies',
  //       title: 'Replies',
  //       translate: 'REPLIES',
  //       type: 'item',
  //       icon: 'material-outline:quickreply',
  //       url: '/settings/replies',
  //       auth: authRoles.user,
  //     },

  //     {
  //       id: 'apps.users-group',
  //       title: 'Users',
  //       translate: 'USERS',
  //       type: 'collapse',
  //       icon: 'heroicons-outline:user',
  //       auth: authRoles.user,
  //       children: [
  //         {
  //           id: 'apps.users-group.users',
  //           title: 'Users',
  //           translate: 'USERS',
  //           type: 'item',
  //           icon: 'heroicons-outline:user',
  //           url: '/apps/users',
  //           auth: authRoles.user,
  //         },

  //         {
  //           id: 'teams',
  //           title: 'Teams',
  //           translate: 'TEAMS',
  //           type: 'item',
  //           icon: 'heroicons-outline:users',
  //           url: '/apps/teams',
  //           auth: authRoles.admin,
  //         },
  //       ],
  //     },
  //   ],
  // },

  {
    type: 'divider',
    id: 'divider-2',
  },

  {
    id: 'more',
    title: 'More',
    translate: 'MORE',
    type: 'group',
    icon: 'material-outline:more_horiz',
    children: [
      {
        id: 'settings',
        title: 'Settings',
        translate: 'SETTINGS',
        type: 'item',
        icon: 'material-outline:settings',
        url: '/settings',
        auth: authRoles.user,
      },
      {
        id: 'doc-link',
        title: 'Documentation',
        translate: 'DOCUMENTATION',
        type: 'link',
        icon: 'heroicons-outline:book-open',
        url: 'https://fox-doumentation.gitbook.io/fox-connect-documentation/',
        target: '_blank',
      },
      {
        id: 'feedback-link',
        title: 'User Feedback',
        type: 'link',
        icon: 'material-outline:feedback',
        url: 'https://foxconnect.app/user-feedback/',
        target: '_blank',
      },
    ],
  },
];

export default navigationConfig;
