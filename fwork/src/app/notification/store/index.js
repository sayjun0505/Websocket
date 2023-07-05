import { combineReducers } from '@reduxjs/toolkit';
import data from './dataSlice';

const reducer = combineReducers({
  data,
});
export default reducer;
