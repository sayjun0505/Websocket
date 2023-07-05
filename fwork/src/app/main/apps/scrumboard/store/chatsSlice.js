import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChats = createAsyncThunk(
  'scrumboardApp/chats/getChats',
  async (boardId, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/scrumboard/board/${boardId}/chats`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;

    return data;
  }
);

const chatsAdapter = createEntityAdapter({});

export const { selectAll: selectChats, selectById: selectChatById } = chatsAdapter.getSelectors(
  (state) => state.scrumboardApp.chats
);

const chatsSlice = createSlice({
  name: 'scrumboardApp/chats',
  initialState: chatsAdapter.getInitialState({}),
  reducers: {
    resetChats: (state, action) => {},
  },
  extraReducers: {
    [getChats.fulfilled]: chatsAdapter.setAll,
    // [removeCard.fulfilled]: (state, action) => {
    //   return chatsAdapter.removeOne(state, action.payload);
    // },
    // [updateCard.fulfilled]: chatsAdapter.upsertOne,
    // [removeCard.fulfilled]: chatsAdapter.removeOne,
  },
});

export const { resetChats } = chatsSlice.actions;

export default chatsSlice.reducer;
