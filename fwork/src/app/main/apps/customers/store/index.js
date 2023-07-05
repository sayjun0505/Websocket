import { combineReducers } from '@reduxjs/toolkit';
import labels from './labelsSlice';
import channels from './channelsSlice';
import customers from './customersSlice';
import customer from './customerSlice';

const reducer = combineReducers({
  labels,
  channels,
  customers,
  customer,
});

export default reducer;
