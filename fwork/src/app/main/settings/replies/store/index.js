import { combineReducers } from '@reduxjs/toolkit';
import replies from './repliesSlice';
import reply from './replySlice';
// import keywords from './keywordsSlice';
import response from './responseSlice';

const repliesReducers = combineReducers({
  replies,
  reply,
  // keywords,
  response,
});

export default repliesReducers;
