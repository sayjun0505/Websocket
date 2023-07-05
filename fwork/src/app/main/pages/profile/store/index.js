import { combineReducers } from '@reduxjs/toolkit';
import profile from './profileSlice';
import organizations from './organizationsSlice';

const reducer = combineReducers({
  profile,
  organizations,
});

export default reducer;
