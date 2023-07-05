import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import ReplyModel from '../model/ReplyModel';
// import { getReplies } from './quickReply';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

// import { setCurrentResponse } from './responseSlice';

export const getQuickReply = createAsyncThunk(
  'Settings/quickReply/getQuickReply',
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

      // const responseResult = reply.response.map((_response) => ({
      //   ..._response,
      //   data: _response.data ? JSON.parse(_response.data) : {},
      // }));
      const responseResult = reply.response;
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
export const saveQuickReply = createAsyncThunk(
  'Settings/quickReply/saveQuickReply',
  async (data, { dispatch, getState }) => {
    try {
      // console.log('🤖 SAVE Quick Reply data ', data);
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      // convert response order
      const newResponse = data.response.map((element, index) => {
        return { ...element, order: index + 1 };
      });

      // console.log('🤖 SAVE convert response order ', newResponse);

      const response = await axios.put(
        `/api/${organizationId}/reply`,
        {
          reply: { ...data, response: newResponse, type: 'quick' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const replyResult = await response.data;
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
export const removeQuickReply = createAsyncThunk(
  'Settings/quickReply/removeQuickReply',
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
export const updateQuickReplyStatus = createAsyncThunk(
  'Settings/quickReply/updateQuickReplyStatus',
  async (data, { dispatch, getState }) => {
    try {
      // console.log('🤖 SAVE Quick Reply status ', data);
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.put(
        `/api/${organizationId}/reply/${data.id}/${data.status}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const replyResult = await response.data;
      dispatch(
        showMessage({
          message: 'Update Reply status success.',
          variant: 'success', // success error info warning null
        })
      );
      // dispatch(getReplies());

      // console.log('🤖', replyResult);
      return data;
    } catch (error) {
      // console.error('[Settings/quickReply/updateQuickReplyStatus ', error);
      dispatch(
        showMessage({
          message: 'Update Reply status error.',
          variant: 'error', // success error info warning null
        })
      );
      return null;
    }
  }
);

export const selectQuickReply = ({ Settings }) => Settings.quickReply;
// export const selectResponse = ({ repliesSetting }) => repliesSetting.reply.response;

const quickReplySlice = createSlice({
  name: 'repliesSetting/reply',
  initialState: null,
  reducers: {
    newQuickReply: (state, action) => ReplyModel(),
    resetQuickReply: () => null,
  },
  extraReducers: {
    [getQuickReply.pending]: (state, action) => null,
    [getQuickReply.fulfilled]: (state, action) => action.payload,
  },
});

export const { newQuickReply, resetQuickReply } = quickReplySlice.actions;

export default quickReplySlice.reducer;
