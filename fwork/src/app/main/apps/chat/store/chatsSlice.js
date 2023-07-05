/* eslint-disable no-plusplus */
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import axios from 'axios';
import { updateNavigationItem } from 'app/store/fuse/navigationSlice';

import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChats = createAsyncThunk(
  'chatApp/chats/getChats',
  async ({ page, size, chatType, filterLabel }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { chatListType, labelFilter } = getState().chatApp.chats;
    const type = chatType || chatListType || 'active';
    const label = filterLabel || labelFilter || [];
    const _page = page || 1;
    const _size = size || 10;
    try {
      const response = await axios.get(`/api/${organizationId}/chat/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          type,
          label: label.toString(),
        },
      });
      const result = await response.data;
      let unReads = 0;
      for (let index = 0; index < result.length; index++) {
        let unRead = 0;
        unRead = result[index].unread;
        unReads += unRead;
      }
      if (unReads > 0) {
        dispatch(
          updateNavigationItem('apps.chat', {
            badge: {
              title: unReads,
              bg: '#8180E7',
              fg: '#FFFFFF',
            },
          })
        );
      } else {
        dispatch(
          updateNavigationItem('apps.inbox', {
            badge: null,
          })
        );
      }
      return result.data;
    } catch (error) {
      return [];
    }
  }
);
export const getChatsinTabforSocket = createAsyncThunk(
  'chatApp/chats/getChats',
  async (result, { dispatch, getState }) => {
    try {
      let unReads = 0;
      for (let index = 0; index < result.length; index++) {
        let unRead = 0;
        unRead = result[index].unread;
        unReads += unRead;
      }
      if (unReads > 0) {
        dispatch(
          updateNavigationItem('apps.chat', {
            badge: {
              title: unReads,
              bg: '#8180E7',
              fg: '#FFFFFF',
            },
          })
        );
      } else {
        dispatch(
          updateNavigationItem('apps.inbox', {
            badge: null,
          })
        );
      }
      return result;
    } catch (error) {
      console.error('Get Chat list error ', error);
      return [];
    }
  }
);

const chatsAdapter = createEntityAdapter({});

export const { selectAll: selectChats, selectById: selectChatById } = chatsAdapter.getSelectors(
  (state) => state.chatApp.chats
);

const chatsSlice = createSlice({
  name: 'chatApp/chats',
  initialState: chatsAdapter.getInitialState({
    chatListType: null,
    labelFilter: [],
  }),
  reducers: {
    setChatListType: {
      reducer: (state, action) => {
        state.chatListType = action.payload;
      },
      prepare: (value) => ({ payload: value || 'active' }),
    },
    setLabelFilter: {
      reducer: (state, action) => {
        state.labelFilter = action.payload;
      },
      prepare: (value) => ({ payload: value || [] }),
    },
    updateUnread: chatsAdapter.upsertOne,
    resolvedChat: chatsAdapter.removeOne,
    clearChat: chatsAdapter.removeAll,
  },
  extraReducers: {
    [getChats.fulfilled]: chatsAdapter.setAll,
    [getChatsinTabforSocket.fulfilled]: chatsAdapter.setAll,
  },
});

export const { setChatListType, setLabelFilter, updateUnread, resolvedChat, clearChat } =
  chatsSlice.actions;

export default chatsSlice.reducer;
