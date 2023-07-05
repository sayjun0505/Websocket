import { combineReducers } from '@reduxjs/toolkit';
import channels from './channelsSlice';
import chats from './chatsSlice';
import address from './addressSlice';
import chat from './chatSlice';
import messages from './messagesSlice';
import comments from './commentsSlice';
import reply from './replySlice';
// import user from './userSlice';
import users from './usersSlice';
import histories from './historiesSlice';
// import history from './historySlice';
import customer from './customerSlice';

import labels from './labelsSlice';

const reducer = combineReducers({
  address,
  // user,
  users,
  chats,
  chat,
  channels,
  messages,
  comments,
  reply,
  histories,
  // history,
  customer,

  labels,
});

export default reducer;
