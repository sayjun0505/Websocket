import { combineReducers } from '@reduxjs/toolkit';
import notification from './notificationSlice';
import organization from './organizationSlice';

const reducer = combineReducers({
  organization,
  notification,
});

export default reducer;
