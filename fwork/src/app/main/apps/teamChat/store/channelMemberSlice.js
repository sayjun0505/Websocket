import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import history from '@history';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';

// eslint-disable-next-line import/no-cycle
import { getChannels } from './channelsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getMember = createAsyncThunk(
  'teamchatApp/channelMember/getMember',
  async ({ channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(
        `/api/${organizationId}/teamChat/getChannelMembers/${channelId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return null;
      // dispatch(showMessage({ message: 'Get Channel Member error', variant: 'error' }));
      // throw error;
    }
  }
);

export const removeChannelMember = createAsyncThunk(
  'teamchatApp/channelMember/removeChannelMember',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { channel } = getState().teamchatApp;
      const response = await axios.delete(
        `/api/${organizationId}/teamChat/deleteChannelMembers/${params.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(showMessage({ message: 'Member Removed', variant: 'success' }));
      if (channel && channel.id) {
        dispatch(getMember({ channelId: channel.id }));
        dispatch(getChannels());
      }
      if (params && params.me) {
        history.push({ pathname: `/apps/teamChat` });
      }
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove member error', variant: 'error' }));
      return null;
    }
  }
);

const channelMemberSlice = createSlice({
  name: 'teamchatApp/channelMember',
  initialState: null,
  extraReducers: {
    [getMember.fulfilled]: (state, action) => action.payload,
  },
});

export const selectMember = ({ teamchatApp }) => teamchatApp.channelMember;

export default channelMemberSlice.reducer;
