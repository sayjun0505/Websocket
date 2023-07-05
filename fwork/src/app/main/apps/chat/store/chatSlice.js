import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import history from '@history';
import { resolvedChat } from './chatsSlice';
import { getMessages } from './messagesSlice';
import { updateNavigationItem } from 'app/store/fuse/navigationSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChat = createAsyncThunk(
  'chatApp/chat/getChat',
  async ({ chatId }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    try {
      const response = await axios.get(`/api/${organizationId}/chat`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: chatId,
        },
      });

      const data = await response.data;
      return data;
    } catch (error) {
      // console.error('Get Chat error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return {};
    }
  }
);
export const getChatinChatforSocket = createAsyncThunk(
  'chatApp/chat/getChat',
  async (data, { dispatch, getState }) => {
    try {
      return data;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return {};
    }
  }
);

export const updateChat = createAsyncThunk(
  'chatApp/chat/updateChat',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat`,
        { chat },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      dispatch(showMessage({ message: 'Chat Updated', variant: 'success' }));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return {};
    }
  }
);

export const updateChatStatus = createAsyncThunk(
  'chatApp/chat/updateChatStatus',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat/status`,
        { chat },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      dispatch(showMessage({ message: 'Chat Updated', variant: 'success' }));
      // console.log('chat ', chat);
      if (chat.status === 'resolved') {
        dispatch(resolvedChat(chat.id));
        history.push('/apps/chat');
      }
      // dispatch(getChat({ chatId: chat.id }));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return {};
    }
  }
);

export const updateChatOwner = createAsyncThunk(
  'chatApp/chat/updateChatOwner',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat/owner`,
        { chat },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      dispatch(showMessage({ message: 'Chat Updated', variant: 'success' }));
      return chatResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return {};
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chatApp/chat/sendMessage',
  async ({ messageText, chatId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/chat/sendMessage`,
        {
          chatId,
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
      console.error("c",chatResult)
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Send message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);
export const sendMessageinChatforSocket = createAsyncThunk(
  'chatApp/chat/sendMessage',
  async (result, { dispatch, getState }) => {
    try {
      return result;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Send message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);
export const sendFileMessage = createAsyncThunk(
  'chatApp/chat/sendFileMessage',
  async ({ formData, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/chat/uploads/${chat.channelId}/${chat.customerId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
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
          fileExt.toLowerCase() === 'jpeg' ||
          fileExt.toLowerCase() === 'gif' ||
          fileExt.toLowerCase() === 'png'
        ) {
          type = 'image';
        } else if (
          fileExt.toLowerCase() === 'mp4' ||
          fileExt.toLowerCase() === 'avi' ||
          fileExt.toLowerCase() === '3gp'
        ) {
          type = 'video';
        } else {
          type = 'file';
        }
      }

      return setTimeout(async () => {
        try {
          const response = await axios.post(
            `/api/${organizationId}/chat/sendMessage`,
            {
              chatId: chat.id,
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

          dispatch(getMessages({ chatId: chat.id }));
          return sendImageMsgResponse;
        } catch (error) {
          return {};
        }
      }, 3000);
    } catch (error) {
      return null;
    }
  }
);

const chatSlice = createSlice({
  name: 'chatApp/chat',
  initialState: null,
  reducers: {
    removeChat: (state, action) => null,
  },
  extraReducers: {
    [getChat.fulfilled]: (state, action) => action.payload,
    [getChatinChatforSocket.fulfilled]: (state, action) => action.payload,
    [updateChat.fulfilled]: (state, action) => action.payload,
    [updateChatOwner.fulfilled]: (state, action) => {
      state.ownerId = action.payload.ownerId;
    },
  },
});

export const selectChat = ({ chatApp }) => chatApp.chat;

export const { removeChat } = chatSlice.actions;

export default chatSlice.reducer;
