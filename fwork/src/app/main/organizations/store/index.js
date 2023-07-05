import { combineReducers } from '@reduxjs/toolkit';

import organizations from './organizationsSlice';
import packages from './packagesSlice';
import activations from './activationsSlice';

const reducer = combineReducers({
  organizations,
  activations,
  packages,
});

export default reducer;
