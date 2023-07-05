import { lazy } from 'react';
import authRoles from '../../../auth/authRoles';
import CustomerView from './customer/CustomerView';
import CustomerForm from './customer/CustomerForm';

const CustomersApp = lazy(() => import('./CustomersApp'));

const CustomersAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.user,
  routes: [
    {
      path: 'apps/customers',
      element: <CustomersApp />,
      children: [
        {
          path: ':id',
          element: <CustomerView />,
        },
        {
          path: ':id/edit',
          element: <CustomerForm />,
        },
      ],
    },
  ],
};

export default CustomersAppConfig;
