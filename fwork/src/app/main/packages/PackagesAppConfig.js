import authRoles from '../../auth/authRoles';
import PackageView from './package/PackageView';
import PackageForm from './package/PackageForm';
import PackagePayment from './package/PackagePayment';
import NewPackageApp from './newPackage/NewPackageApp';
import NewPackageForm from './newPackage/NewPackageForm';
import Payments from './payments/Payments';
import Payment from './payment/Payment';
import InviteCodeList from './invite/InviteCodeList';
import PackagesApp from './PackagesApp';

const PackagesAppConfig = {
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
      path: '/packages/pricing',
      element: <NewPackageApp />,
      children: [
        {
          path: 'new/:type/:id',
          element: <NewPackageForm />,
        },
        // {
        //   path: ':id/payment',
        //   element: <PackagePayment />,
        // },
        // {
        //   path: ':id/edit',
        //   element: <PackageForm />,
        // },
      ],
    },
    {
      path: '/packages/:id/history/:paymentId',
      element: <Payment />,
    },
    {
      path: '/packages/:id/history',
      element: <Payments />,
    },
    {
      path: '/packages',
      element: <PackagesApp />,
      children: [
        {
          path: ':id',
          element: <PackageView />,
        },
        {
          path: ':id/payment',
          element: <PackagePayment />,
        },
        {
          path: ':id/history',
          element: <Payments />,
        },
        {
          path: ':id/edit',
          element: <PackageForm />,
        },
      ],
    },
    {
      path: '/packages/invite',
      element: <InviteCodeList />,
    },
  ],
};

export default PackagesAppConfig;
