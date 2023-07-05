import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getComments = createAsyncThunk(
  'chatApp/comments/getComments',
  async ({ chatId, page, size }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const _page = page || 0;
    const _size = size || 0;
    try {
      const response = await axios.get(`/api/${organizationId}/chat/comment/${chatId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: _page,
          size: _size,
        },
      });
      const result = await response.data;
      // console.log('[COMMENTS] result ', result);
      return result.data;
    } catch (error) {
      // console.error('Get Comments error ', error);
      return [];
    }
  }
);

export const updatePinComment = createAsyncThunk(
  'chatApp/comments/updateComment',
  async (comment, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { id: chatId } = getState().chatApp.chat;
      const response = await axios.post(
        `/api/${organizationId}/chat/comment/pinMessage`,
        { comment },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updateResult = await response.data;
      dispatch(getComments({ chatId }));
      return updateResult;
      // return { id: updateResult.id, changes: { isPin: updateResult.isPin } };
    } catch (error) {
      dispatch(showMessage({ message: 'Update comment error', variant: 'error' }));
      return {};
    }
  }
);

export const sendCommentMessage = createAsyncThunk(
  'chatApp/comments/sendCommentMessage',
  async ({ messageText, chatId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/chat/comment/sendMessage`,
        {
          message: {
            data: JSON.stringify({ text: messageText }),
            type: 'text',
            chatId,
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
      dispatch(getComments({ chatId }));
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Send Comment message error',
          variant: 'error', // success error info warning null
        })
      );
      return null;
    }
  }
);

export const sendCommentFileMessage = createAsyncThunk(
  'chatApp/comments/sendCommentFileMessage',
  async ({ formData, chatId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/chat/comment/uploads/${chatId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fileResponseResult = await fileUploadResponse.data;

      // wait file upload 3sec
      return setTimeout(async () => {
        const response = await axios.post(
          `/api/${organizationId}/chat/comment/sendMessage`,

          {
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type: 'image',
              chatId,
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
        dispatch(getComments({ chatId }));
        return sendImageMsgResponse;
      }, 3000);
    } catch (error) {
      return null;
    }
  }
);

export const markMentionRead = createAsyncThunk(
  'chatApp/comments/markMentionRead',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();

      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat/comment/read`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error) {
      return null;
    }
  }
);

const commentsAdapter = createEntityAdapter({});

export const { selectAll: selectComments, selectById: selectCommentById } =
  commentsAdapter.getSelectors((state) => state.chatApp.comments);

const commentsSlice = createSlice({
  name: 'chatApp/comments',
  initialState: commentsAdapter.getInitialState(),
  reducers: {
   
  },
  extraReducers: {
    [getComments.pending]: commentsAdapter.removeAll,
    [getComments.fulfilled]: commentsAdapter.setAll,
    // [updatePinComment.fulfilled]: commentsAdapter.updateOne,
    // [sendCommentMessage.fulfilled]: commentsAdapter.addOne,
    // [sendCommentFileMessage.fulfilled]: commentsAdapter.addOne,
  },
});

export const { pinCommentMessage, unPinCommentMessage } = commentsSlice.actions;

export default commentsSlice.reducer;
