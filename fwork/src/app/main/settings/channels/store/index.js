import { combineReducers } from '@reduxjs/toolkit';
import channels from './channelsSlice';
import channel from './channelSlice';
import facebook from './facebookSlice';

const reducer = combineReducers({
  channels,
  channel,
  facebook,
});

export default reducer;
