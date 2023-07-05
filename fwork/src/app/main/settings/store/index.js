import { combineReducers } from '@reduxjs/toolkit';
import notification from './notificationSlice';
import organization from './organizationSlice';
import quickReplies from './quickRepliesSlice';
import autoReplies from './autoRepliesSlice';
// import reply from './replySlice';
import quickReply from './quickReplySlice';
import autoReply from './autoReplySlice';
// import keywords from './keywordsSlice';
import response from './responseSlice';

const reducer = combineReducers({
  organization,
  notification,
  quickReplies,
  quickReply,
  autoReplies,
  autoReply,
  // keywords,
  response,
});

export default reducer;
