import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { getChats } from './chatsSlice';
import { getChat } from './chatSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getReplies = createAsyncThunk(
  'chatApp/reply/getReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/reply/list/quick`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const quickReply = await response.data;
      // Filter reply no response
      const filterReply = await quickReply.filter(
        (reply) => reply.response && reply.response.length > 0 && reply.status === 'active'
      );
      return filterReply;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Quick Reply error', variant: 'error' }));
      return null;
    }
  }
);

export const sendReply = createAsyncThunk(
  'chatApp/reply/sendReply',
  async ({ reply, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.post(
        `/api/${organizationId}/chat/sendReplyMessage`,
        {
          chatId: chat.id,
          replyId: reply.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      dispatch(getChat({ chatId: chat.id }));
      dispatch(getChats());
      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Send Quick Reply error', variant: 'error' }));
      return {};
    }
  }
);

const replySlice = createSlice({
  name: 'chatApp/reply',
  initialState: null,
  reducers: {},
  extraReducers: {
    [getReplies.fulfilled]: (state, action) => action.payload,
  },
});

export const selectReply = ({ chatApp }) => chatApp.reply;

export default replySlice.reducer;
