import { combineReducers } from '@reduxjs/toolkit';

import activation from './activationSlice';
import activations from './activationsSlice';
import creditCard from './creditCardSlice';
import packages from './packagesSlice';
import payments from './paymentsSlice';
import payment from './paymentSlice';

import invite from './inviteCodeSlice';

const reducer = combineReducers({
  activation,
  activations,
  creditCard,
  packages,
  payments,
  payment,
  invite,
});

export default reducer;
