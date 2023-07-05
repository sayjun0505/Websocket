import SignInPage from './SignInPage';
import SignInWithPhonePage from './SignInWithPhonePage';
import authRoles from '../../../../auth/authRoles';

const SignInConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
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
  auth: authRoles.onlyGuest,
  routes: [
    {
      path: 'sign-in',
      element: <SignInPage />,
    },
    {
      path: 'sign-in-phone',
      element: <SignInWithPhonePage />,
    },
  ],
};

export default SignInConfig;
