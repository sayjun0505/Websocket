import { combineReducers } from '@reduxjs/toolkit';
// import chats from "./chatsSlice";
// import chat from "./chatSlice";
// import contacts from "./contactsSlice";
// import user from "./userSlice";
import channel from './channelSlice';
import channels from './channelsSlice';
import channelMember from './channelMemberSlice';
import directMessage from './directMessageSlice';
import directMessageUser from './directMessageUserSlice';
import directMessageUsers from './directMessageUsersSlice';
import hq from './hqSlice';
import thread from './threadSlice';

const reducer = combineReducers({
  channel,
  channels,
  channelMember,
  directMessage,
  directMessageUser,
  directMessageUsers,
  hq,
  thread,
});

export default reducer;
