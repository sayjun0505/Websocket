import authRoles from '../../auth/authRoles';
import OrganizationsApp from './OrganizationsApp';

const OrganizationsAppConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: '/organizations',
      element: <OrganizationsApp />,
    },
  ],
};

export default OrganizationsAppConfig;
