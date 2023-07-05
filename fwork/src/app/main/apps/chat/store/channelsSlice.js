import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChannels = createAsyncThunk(
  'chatApp/channels/getChannels',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/chat/channels`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.data;

    return data;
  }
);
export const getChannelsforSocket = createAsyncThunk(
  'chatApp/channels/getChannels',
  async (params, { dispatch, getState }) => {
    return params;
  }
);
const channelsAdapter = createEntityAdapter({});

export const { selectAll: selectChannels, selectById: selectChannelById } =
  channelsAdapter.getSelectors((state) => state.chatApp.channels);

const channelsSlice = createSlice({
  name: 'chatApp/channels',
  initialState: channelsAdapter.getInitialState(),
  reducers: {
    setChannelsforSocket: (state, action) => {
      channelsAdapter.setAll(state, action.payload)
    },
  },
  extraReducers: {
    [getChannels.fulfilled]: channelsAdapter.setAll,
    [getChannelsforSocket.fulfilled]: channelsAdapter.setAll,
  },
});
export const { setChannelsforSocket } = channelsSlice.actions;
export default channelsSlice.reducer;
