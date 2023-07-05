import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { closeMobileChatsSidebar } from './sidebarsSlice';
import { setHistorySelected } from './currentSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getHistories = createAsyncThunk(
  'chatApp/history/getHistories',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/chat/history/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.data;
      return result;
    } catch (error) {
      // console.error('getHistories ', error);
      return [];
    }
  }
);

export const getHistory = createAsyncThunk(
  'chatApp/history/getHistory',
  async ({ historyId, isMobile }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/chat/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: historyId,
        },
      });
      const history = await response.data;

      dispatch(setHistorySelected(history));
      if (isMobile) {
        dispatch(closeMobileChatsSidebar());
      }
      return history;
    } catch (error) {
      // console.error('getHistory ', error);
      return null;
    }
  }
);

const historyAdapter = createEntityAdapter({});

export const { selectAll: selectHistories, selectById: selectHistoryById } =
  historyAdapter.getSelectors((state) => state.chatApp.history);

const historySlice = createSlice({
  name: 'todoApp/history',
  initialState: historyAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setHistorySearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    clearHistory: (state, action) => {
      state = historyAdapter.getInitialState({
        searchText: '',
      });
    },
  },
  extraReducers: {
    [getHistories.fulfilled]: (state, action) => {
      historyAdapter.setAll(state, action.payload);
    },
  },
});

export const { setHistorySearchText, clearHistory } = historySlice.actions;

export default historySlice.reducer;
