import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import SignInConfig from '../main/pages/auth/sign-in/SignInConfig';
import SignUpConfig from '../main/pages/auth/sign-up/SignUpConfig';
import SignOutConfig from '../main/pages/auth/sign-out/SignOutConfig';
import ForgotPasswordConfig from '../main/pages/auth/forgot-password/ForgotPasswordConfig';
import LinkUserConfig from '../main/pages/auth/link-user/LinkUserConfig';
// import ExampleConfig from '../main/example/ExampleConfig';
import ErrorPageConfig from '../main/pages/errors/ErrorPageConfig';

import appsConfigs from '../main/apps/appsConfigs';
import pagesConfigs from '../main/pages/pagesConfigs';

import SettingsFoxConfig from '../main/settings/SettingsConfig';

import OrganizationsAppConfig from '../main/organizations/OrganizationsAppConfig';
import PackagesAppConfig from '../main/packages/PackagesAppConfig';

const routeConfigs = [
  ...appsConfigs,
  ...pagesConfigs,
  SettingsFoxConfig,
  // ExampleConfig,
  SignOutConfig,
  SignInConfig,
  SignUpConfig,
  ForgotPasswordConfig,
  LinkUserConfig,
  OrganizationsAppConfig,
  PackagesAppConfig,
  ErrorPageConfig,
];

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
  {
    path: '/',
    element: <Navigate to="/apps/chat" />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: 'loading',
    element: <FuseLoading />,
  },
  {
    path: '*',
    element: <Navigate to="404" />,
  },
];

export default routes;
