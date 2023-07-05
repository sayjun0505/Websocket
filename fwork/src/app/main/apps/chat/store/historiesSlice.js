import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getHistories = createAsyncThunk(
  'chatApp/histories/getHistories',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
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
      return [];
    }
  }
);

const historiesAdapter = createEntityAdapter({});

export const { selectAll: selectHistories, selectById: selectHistoryById } =
  historiesAdapter.getSelectors((state) => state.chatApp.histories);

const historiesSlice = createSlice({
  name: 'chatApp/histories',
  initialState: historiesAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setHistoriesSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    clearHistories: (state, action) => {
      state = historiesAdapter.getInitialState({
        searchText: '',
      });
    },
  },
  extraReducers: {
    [getHistories.fulfilled]: (state, action) => {
      historiesAdapter.setAll(state, action.payload);
    },
  },
});

export const { setHistoriesSearchText, clearHistories } = historiesSlice.actions;

export default historiesSlice.reducer;
