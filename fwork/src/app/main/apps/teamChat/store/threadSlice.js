/* eslint-disable import/named */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import { setHqReplyMessage } from './hqSlice';
import { setCmReplyMessage } from './channelSlice';
import { setDmReplyMessage } from './directMessageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getHqReplies = createAsyncThunk(
  'teamchatApp/threads/getHqReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(
        `/api/${organizationId}/teamChat/threadMessages/getHqReplies`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Replies error', variant: 'error' }));
      throw error;
    }
  }
);

export const getCmReplies = createAsyncThunk(
  'teamchatApp/threads/getCmReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(
        `/api/${organizationId}/teamChat/threadMessages/getCmReplies`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Replies error', variant: 'error' }));
      throw error;
    }
  }
);

export const getDmReplies = createAsyncThunk(
  'teamchatApp/threads/getDmReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(
        `/api/${organizationId}/teamChat/threadMessages/getDmReplies`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Replies error', variant: 'error' }));
      throw error;
    }
  }
);

export const getThreadMessage = createAsyncThunk(
  'teamchatApp/threads/getThreadMessage',
  async ({ threadId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.get(
        `/api/${organizationId}/teamChat/threadMessage/${threadId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get thread error', variant: 'error' }));
      return {};
    }
  }
);

export const sendMessage = createAsyncThunk(
  'teamchatApp/ThreadMessage/sendMessage',
  async ({ messageText, threadId, threadType, channelId, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/threadMessage`,
        {
          threadId,
          threadType,
          message: {
            data: JSON.stringify({ text: messageText }),
            type: 'text',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getThreadMessage({ threadId }));
      if (channelId) {
        await dispatch(
          setCmReplyMessage({
            message: { id: threadId, isReply: true },
            channelId,
          })
        );
        await dispatch(getCmReplies());
      } else if (contactId) {
        await dispatch(
          setDmReplyMessage({
            message: { id: threadId, isReply: true },
            contactId,
          })
        );
        await dispatch(getDmReplies());
      } else {
        await dispatch(
          setHqReplyMessage({
            id: threadId,
            isReply: true,
          })
        );
        await dispatch(getHqReplies());
      }
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Send TeamChat message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const sendFileMessage = createAsyncThunk(
  'teamchatApp/thread/sendFileMessage',
  async ({ formData, threadId, threadType, channelId, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;

      // console.log('[formData] ', formData);
      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/teamChat/threadMessage/uploads/${threadId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fileResponseResult = await fileUploadResponse.data;
      const fileExt = fileResponseResult.fileName.split('.').pop();
      let type = 'image';
      if (fileExt) {
        if (
          fileExt.toLowerCase() === 'jpg' ||
          fileExt.toLowerCase() === 'gif' ||
          fileExt.toLowerCase() === 'png'
        ) {
          type = 'image';
        } else if (fileExt.toLowerCase() === 'mp4') {
          type = 'video';
        } else {
          type = 'file';
        }
      }

      // wait file upload 3sec
      return setTimeout(async () => {
        const response = await axios.post(
          `/api/${organizationId}/teamChat/threadMessage`,
          {
            threadId,
            threadType,
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sendImageMsgResponse = await response.data;
        if (channelId) {
          await dispatch(
            setCmReplyMessage({
              message: { id: threadId, isReply: true },
              channelId,
            })
          );
          await dispatch(getCmReplies());
        } else if (contactId) {
          await dispatch(
            setDmReplyMessage({
              message: { id: threadId, isReply: true },
              contactId,
            })
          );
          await dispatch(getDmReplies());
        } else {
          await dispatch(
            setHqReplyMessage({
              id: threadId,
              isReply: true,
            })
          );
          await dispatch(getHqReplies());
        }
        setTimeout(async () => {
          dispatch(getThreadMessage({ threadId }));
        }, 1000);
        return sendImageMsgResponse;
      }, 4000);
    } catch (error) {
      // console.error('[teamchatApp/thread/sendFileMessage] ', error);
      return null;
    }
  }
);

export const getThreadMembers = createAsyncThunk(
  'teamchatApp/threads/getThreadMessage/getThreadMembers',
  async ({ threadIds }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/threadMessages/getThreads`,
        {
          threadIds,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get threadMembers error', variant: 'error' }));
      return {};
    }
  }
);

const threadSlice = createSlice({
  name: 'teamchatApp/thread',
  initialState: {
    id: '',
    data: [],
    messages: [],
    members: [],
    basedata: '',
    basecreatedBy: '',
    basecreatedAt: '',
    basetype: '',
  },
  reducers: {
    setThreadId: (state, action) => {
      if (state && state.messages) {
        state.id = action.payload.threadId;
        state.basedata = action.payload.messageText;
        state.basecreatedBy = action.payload.createdBy;
        state.basecreatedAt = action.payload.createdAt;
        state.basetype = action.payload.type;
      }
    },
  },
  extraReducers: {
    [getHqReplies.fulfilled]: (state, action) => {
      state.data = action.payload;
    },
    [getCmReplies.fulfilled]: (state, action) => {
      state.data = action.payload;
    },
    [getDmReplies.fulfilled]: (state, action) => {
      state.data = action.payload;
    },
    [getThreadMessage.fulfilled]: (state, action) => {
      state.messages = action.payload || [];
    },
    [getThreadMembers.fulfilled]: (state, action) => {
      state.members = action.payload || [];
    },
  },
});

export const selectThreadMessages = ({ teamchatApp }) => teamchatApp.thread.messages;
export const selectThreadData = ({ teamchatApp }) => teamchatApp.thread.data;
export const selectThreadMembers = ({ teamchatApp }) => teamchatApp.thread.members;
export const { setThreadId, addSendingMessage } = threadSlice.actions;
export default threadSlice.reducer;
