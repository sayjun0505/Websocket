import { combineReducers } from '@reduxjs/toolkit';

import chatApp from 'src/app/main/apps/chat/store';
import fuse from './fuse';
import i18n from './i18nSlice';
import user from './userSlice';
import organization from './organizationSlice';
import notifications from './notificationsSlice';
import permission from './permissionSlice';

const createReducer = (asyncReducers) => (state, action) => {
  const combinedReducer = combineReducers({
    fuse,
    i18n,
    user,
    notifications,
    organization,
    permission,
    chatApp,
    ...asyncReducers,
  });

  /*
	Reset the redux store when user logged out
	 */
  if (action.type === 'user/userLoggedOut') {
    // state = undefined;
  }

  return combinedReducer(state, action);
};

export default createReducer;
