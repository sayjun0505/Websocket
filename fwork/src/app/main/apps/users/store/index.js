import { combineReducers } from '@reduxjs/toolkit';
import teams from './teamsSlice';
import users from './usersSlice';
import user from './userSlice';

const reducer = combineReducers({
  teams,
  users,
  user,
});

export default reducer;
