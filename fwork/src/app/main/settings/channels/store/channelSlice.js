import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import history from '@history';
import LineChannelModel from '../model/LineChannelModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChannel = createAsyncThunk(
  'channelsSetting/channel/getChannel',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/channel/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const channel = await response.data;
      return channel;
    } catch (error) {
      // dispatch(showMessage({ message: 'Get Channel error', variant: 'error' }));
      history.push({ pathname: `/settings/channels` });
      return null;
    }
  }
);

export const addLineChannel = createAsyncThunk(
  'channelsSetting/channel/addLineChannel',
  async (lineChanel, { dispatch, getState }) => {
    const body = {
      channel: {
        channel: 'line',
        line: {
          name: lineChanel.name,
          lineId: lineChanel.lineId,
          accessToken: lineChanel.accessToken,
          channelSecret: lineChanel.channelSecret,
        },
      },
    };
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.post(`/api/${organizationId}/channel`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    dispatch(showMessage({ message: 'Create LINE channel', variant: 'success' }));
    history.push({ pathname: `/settings/channels/line/${data.id}/edit` });
    return data;
  }
);

export const updateLineChannel = createAsyncThunk(
  'channelsSetting/channel/updateLineChannel',
  async (channel, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.put(
      `/api/${organizationId}/channel`,
      { channel },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.data;
    return data;
  }
);

export const removeLineChannel = createAsyncThunk(
  'channelsSetting/channel/removeLineChannel',
  async (channel, { dispatch, getState }) => {
    // console.log('[removeLineChannel] ', channel);
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.delete(`/api/${organizationId}/channel/${channel.id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    dispatch(showMessage({ message: 'Remove LINE OA channel', variant: 'success' }));
    return data.id;
  }
);

export const addInstagramChannel = createAsyncThunk(
  'channelsSetting/channel/addInstagramChannel',
  async (instagramChannel, { dispatch, getState }) => {
    // console.log('[addInstagramChannel] ', instagramChannel);
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    const channel = {
      channel: 'instagram',
      instagram: instagramChannel,
    };
    try {
      const response = await axios.post(
        `/api/${organizationId}/channel`,
        { channel },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      // console.log('[ERROR] ', error.response.data);
      const message =
        error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Add Instagram channel error.';
      dispatch(showMessage({ message, autoHideDuration: 5000, variant: 'error' }));
      throw error;
    }
  }
);
export const removeInstagramChannel = createAsyncThunk(
  'channelsSetting/channel/removeInstagramChannel',
  async (channel, { dispatch, getState }) => {
    // console.log('Remove instagram ', channel);
    // console.log('instagram pageId ', channel.data.pageId);
    // console.log('instagram accessToken ', channel.data.accessToken);
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    try {
      const response = await axios.delete(`/api/${organizationId}/channel/${channel.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      dispatch(showMessage({ message: 'Remove Instagram channel', variant: 'success' }));
      return channel.id;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Remove Instagram channel error',
          variant: 'error',
        })
      );
      throw error;
    }
  }
);

export const addFacebookChannel = createAsyncThunk(
  'channelsSetting/channel/addFacebookChannel',
  async (facebookChanel, { dispatch, getState }) => {
    // console.log('[addFacebookChannel] ', facebookChanel);
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    const channel = {
      channel: 'facebook',
      facebook: facebookChanel,
    };
    try {
      const response = await axios.post(
        `/api/${organizationId}/channel`,
        { channel },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      // console.log('[ERROR] ', error.response.data);
      const message =
        error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Add Facebook channel error.';
      dispatch(showMessage({ message, autoHideDuration: 5000, variant: 'error' }));
      throw error;
    }
  }
);

export const removeFacebookChannel = createAsyncThunk(
  'channelsSetting/channel/removeFacebookChannel',
  async (channel, { dispatch, getState }) => {
    // console.log('Remove facebook ', channel);
    // console.log('facebook pageId ', channel.data.pageId);
    // console.log('facebook accessToken ', channel.data.accessToken);
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    try {
      const currentSubscribeResult = await axios.get(
        `https://graph.facebook.com/v14.0/${channel.data.pageId}/subscribed_apps`,
        {
          headers: {
            Authorization: `Bearer ${channel.data.accessToken}`,
          },
          params: {
            subscribed_fields: 'messages,message_reactions',
          },
        }
      );
      // console.log('currentSubscribeResult ', currentSubscribeResult);
      if (
        currentSubscribeResult &&
        currentSubscribeResult.data &&
        currentSubscribeResult.data.data.length > 0
      ) {
        // need remove subscribe from facebook
        const fields = currentSubscribeResult.data.data[0].subscribed_fields;
        await axios.delete(
          `https://graph.facebook.com/v14.0/${channel.data.pageId}/subscribed_apps`,
          {
            headers: {
              Authorization: `Bearer ${channel.data.accessToken}`,
            },
            params: {
              subscribed_fields: fields,
            },
          }
        );
      }
    } catch (error) {
      // dispatch(showMessage({ message: 'Remove Facebook channel error', variant: 'error' }));
      // console.error('Facebook API error: ', error);
    }
    try {
      // console.log('facebook page ', subscribeResult);
      const response = await axios.delete(`/api/${organizationId}/channel/${channel.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      dispatch(showMessage({ message: 'Remove Facebook Messenger channel', variant: 'success' }));
      return channel.id;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Remove Facebook channel error',
          variant: 'error',
        })
      );
      throw error;
    }
  }
);

export const selectChannel = ({ channelsSetting }) => channelsSetting.channel;

const channelSlice = createSlice({
  name: 'channelsSetting/channel',
  initialState: null,
  reducers: {
    newLineChannel: (state, action) => LineChannelModel(),
    resetChannel: () => null,
  },
  extraReducers: {
    [getChannel.pending]: (state, action) => null,
    [getChannel.fulfilled]: (state, action) => action.payload,
    [updateLineChannel.fulfilled]: (state, action) => action.payload,
    [addLineChannel.fulfilled]: (state, action) => action.payload,
    // [updateFacebookChannel.fulfilled]: (state, action) => action.payload,
    [addFacebookChannel.fulfilled]: (state, action) => action.payload,
  },
});

export const { resetChannel, newLineChannel } = channelSlice.actions;

export default channelSlice.reducer;
