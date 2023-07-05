import { combineReducers } from '@reduxjs/toolkit';
import teams from './teamsSlice';
import team from './teamSlice';

const reducer = combineReducers({
  teams,
  team,
});

export default reducer;
