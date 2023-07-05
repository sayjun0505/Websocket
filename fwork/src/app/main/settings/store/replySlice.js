import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import ReplyModel from '../model/ReplyModel';
// import { getReplies } from './quickReply';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

// import { setCurrentResponse } from './responseSlice';

export const getReply = createAsyncThunk(
  'repliesSetting/reply/getReply',
  async (replyId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/reply/${replyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const reply = await response.data;

      const responseResult = await reply.response;
      responseResult.sort((a, b) => {
        return a.order - b.order;
      });
      // console.log('[Get Reply] ', reply);
      return { ...reply, response: responseResult };
    } catch (error) {
      // console.log('[Get Reply] ', error);
      dispatch(showMessage({ message: 'Get Reply error', variant: 'error' }));
      return null;
    }
  }
);
export const saveReply = createAsyncThunk(
  'repliesSetting/reply/saveReply',
  async (data, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      // convert response order
      const newResponse = data.response.map((element, index) => {
        return { ...element, order: index + 1 };
      });

      const response = await axios.put(
        `/api/${organizationId}/reply`,
        {
          reply: { ...data, response: newResponse },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const replyResult = await response.data;
      // console.log('🤖', replyResult);
      dispatch(
        showMessage({
          message: 'Update Reply success.',
          variant: 'success', // success error info warning null
        })
      );
      // dispatch(getReplies());
      return replyResult;
    } catch (error) {
      // console.error('[repliesSetting/reply/updateReply] ', error);
      dispatch(
        showMessage({
          message: 'Update Reply error.',
          variant: 'error', // success error info warning null
        })
      );
      return null;
    }
  }
);
export const removeReply = createAsyncThunk(
  'repliesSetting/reply/removeReply',
  async (replyId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/reply/${replyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const replyResult = await response.data;
      dispatch(
        showMessage({
          message: 'Delete Reply success.',
          variant: 'success',
        })
      );
      // dispatch(getReply());
      return replyId;
    } catch (error) {
      // console.error('[repliesSetting/reply/removeReply] ', error);
      dispatch(
        showMessage({
          message: 'Delete Reply error.',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const selectReply = ({ repliesSetting }) => repliesSetting.reply;
export const selectResponse = ({ repliesSetting }) => repliesSetting.reply.response;

const replySlice = createSlice({
  name: 'repliesSetting/reply',
  initialState: null,
  reducers: {
    newReply: (state, action) => ReplyModel(),
    resetReply: () => null,
  },
  extraReducers: {
    [getReply.pending]: (state, action) => null,
    [getReply.fulfilled]: (state, action) => action.payload,
  },
});

export const { newReply, resetReply } = replySlice.actions;

export default replySlice.reducer;
