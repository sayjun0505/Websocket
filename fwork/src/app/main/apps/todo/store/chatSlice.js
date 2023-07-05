import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
// import { closeMobileChatsSidebar } from './sidebarsSlice';
import { setChatSelected, updateCurrent } from './currentSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChats = createAsyncThunk(
  'todoApp/chat/getChats',
  async (chatType, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      if (!getState().todoApp) return null;
      const { organizationId } = getState().organization;
      const currentChatType = getState().scrumboardApp.boardCurrent.listType;
      const { filterLabel } = getState().scrumboardApp.boardCurrent;
      const type = currentChatType || chatType || 'assignee';
      const response = await axios.get(`/api/${organizationId}/chat/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          type,
          // label: 'a',
          label: filterLabel.toString(),
        },
      });
      const result = await response.data;
      return result;
    } catch (error) {
      // console.error('Get Chat list error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat list error',
          variant: 'error',
        })
      );
      return [];
    }
  }
);

export const getChat = createAsyncThunk(
  'scrumboardApp/chats/getChat',
  async ({ chatId, isMobile }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      if (!chatId) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/chat`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: chatId,
        },
      });
      const chat = await response.data;
      if (chat) {
        dispatch(setChatSelected(chat));
      }

      if (isMobile) {
        // dispatch(closeMobileChatsSidebar());
      }
      return chat;
    } catch (error) {
      // console.error('Get Chat error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return [];
    }
  }
);

export const getChatMessage = createAsyncThunk(
  'todoApp/chats/getChatMessage',
  async ({ chatId, pNum, isMobile }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      if (!chatId) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/scrumboard/chat/getchatmessage`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: chatId,
          pNum,
        },
      });
      const chat = await response.data;

      if (chat) {
        dispatch(setChatSelected(chat));
      }

      if (isMobile) {
        // dispatch(closeMobileChatsSidebar());
      }
      return chat;
    } catch (error) {
      // console.error('Get Chat error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return [];
    }
  }
);

export const updateChat = createAsyncThunk(
  'todoApp/chats/updateChat',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
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
      dispatch(getChat({ chatId: chat.id }));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return null;
    }
  }
);

export const updateChatOwner = createAsyncThunk(
  'todoApp/chats/updateChat',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
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
      dispatch(showMessage({ message: 'Chat Owner Updated', variant: 'success' }));
      dispatch(getChat({ chatId: chat.id }));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat owner error', variant: 'error' }));
      return null;
    }
  }
);

export const sendMessage = createAsyncThunk(
  'todoApp/chats/sendMessage',
  async ({ messageText, chat, pNum }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/chat/sendMessage`,
        {
          chatId: chat.id,
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
      dispatch(getChatMessage({ chatId: chat.id, pNum: chat.pageNumber }));
      // dispatch(getChats());
      return chatResult;
    } catch (error) {
      // console.error('[todoApp/chats/sendMessage] ', error);
      dispatch(
        showMessage({
          message: 'Send message error',
          variant: 'error', // success error info warning null
        })
      );
      return null;
    }
  }
);

export const sendFileMessage = createAsyncThunk(
  'todoApp/chats/sendFileMessage',
  async ({ formData, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;

      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/chat/uploads/${chat.channel.id}/${chat.customer.uid}`,
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
          `/api/${organizationId}/chat/sendMessage`,

          {
            chatId: chat.id,
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type: 'image',
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

        dispatch(getChatMessage({ chatId: chat.id, pNum: chat.pageNumber }));
        // dispatch(getChats());
        return sendImageMsgResponse;
      }, 3000);
    } catch (error) {
      // console.error('[todoApp/chats/sendFileMessage] ', error);
      return null;
    }
  }
);

export const sendTeamChatMessage = createAsyncThunk(
  'todoApp/chats/sendTeamChatMessage',
  async ({ messageText, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/sendMessage`,
        {
          chatId: chat.id,
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
      dispatch(getChatMessage({ chatId: chat.id, pNum: chat.pageNumber }));
      return chatResult;
    } catch (error) {
      // console.error('TeamChat ', error);
      dispatch(
        showMessage({
          message: 'Send TeamChat message error',
          variant: 'error', // success error info warning null
        })
      );
      return null;
    }
  }
);

export const sendTeamChatFileMessage = createAsyncThunk(
  'todoApp/chats/sendTeamChatFileMessage',
  async ({ formData, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;

      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/teamChat/uploads/${chat.id}`,
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
          `/api/${organizationId}/teamChat/sendMessage`,

          {
            chatId: chat.id,
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type: 'image',
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

        dispatch(getChatMessage({ chatId: chat.id, pNum: chat.pageNumber }));
        // dispatch(getChats());
        return sendImageMsgResponse;
      }, 3000);
    } catch (error) {
      // console.error('[todoApp/chats/sendTeamChatFileMessage] ', error);
      return null;
    }
  }
);

export const markMentionRead = createAsyncThunk(
  'todoApp/chats/markMentionRead',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/teamChat/read`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateCurrent());
      dispatch(getChats());
      return response;
    } catch (error) {
      // console.error('TeamChat ', error);
      return null;
    }
  }
);

const chatsAdapter = createEntityAdapter({});

export const { selectAll: selectChats, selectById: selectChatsById } = chatsAdapter.getSelectors(
  (state) => state.scrumboardApp.boardChat
);

const chatSlice = createSlice({
  name: 'todoApp/chat',
  initialState: chatsAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setChatsSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    clearChat: (state, action) =>
      chatsAdapter.getInitialState({
        searchText: '',
      }),
  },
  extraReducers: {
    [getChats.fulfilled]: (state, action) => {
      chatsAdapter.setAll(state, action.payload);
    },
  },
});

export const { setChatsSearchText, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
