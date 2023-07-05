import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// import { showMessage } from 'app/store/fuse/messageSlice';
// import history from '@history';
// import LineChannelModel from '../model/LineChannelModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getFacebookUser = createAsyncThunk(
  'channelsSetting/facebook/getFacebookUser',
  async (accessToken, { dispatch, getState }) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v12.0/me?fields=picture{url},name,email&access_token=${accessToken}`
      );
      const profile = await response.data;
      return profile;
    } catch (error) {
      // dispatch(showMessage({ message: 'Get Channel error', variant: 'error' }));
      // history.push({ pathname: `/settings/channels` });
      return null;
    }
  }
);

export const getPageList = createAsyncThunk(
  'channelsSetting/facebook/getPageList',
  async ({ userID, accessToken }, { dispatch, getState }) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v12.0/${userID}/accounts?access_token=${accessToken}`,
        {
          params: {
            fields:
              'instagram_business_account{id,name,username,profile_picture_url},access_token,id,name,picture,category',
          },
        }
      );
      const pages = await response.data;
      // console.log('[PAGES] ', await pages.data);
      return pages.data;
    } catch (error) {
      return [];
    }
  }
);
export const getPageInstagramList = createAsyncThunk(
  'channelsSetting/facebook/getPageInstagramList',
  async ({ userID, accessToken }, { dispatch, getState }) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v15.0/${userID}/instagram_accounts?access_token=${accessToken}`
      );
      const pages = await response.data;
      // console.log('[IG] ', await pages);
      return pages.data;
    } catch (error) {
      return [];
    }
  }
);

export const exchangeToken = createAsyncThunk(
  'channelsSetting/facebook/exchangeToken',
  async (accessToken, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(
      `/api/${organizationId}/channel/exchangeToken/${accessToken}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.data;
    dispatch(addFacebookUserTokenChannel(data.access_token));
    dispatch(getFacebookUser(data.access_token));
    return data;
  }
);

export const addFacebookUserTokenChannel = createAsyncThunk(
  'channelsSetting/facebook/addFacebookUserTokenChannel',
  async (facebookToken, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const id = getState().user.uuid;
    const { organizationId } = getState().organization;
    const response = await axios.put(
      `/api/${organizationId}/user`,
      { user: { id, facebookToken } },
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
export const removeFacebookUserTokenChannel = createAsyncThunk(
  'channelsSetting/facebook/removeFacebookUserTokenChannel',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const id = getState().user.uuid;
    const { organizationId } = getState().organization;
    const response = await axios.put(
      `/api/${organizationId}/user`,
      { user: { id, facebookToken: '' } },
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

export const selectFacebookUser = ({ channelsSetting }) => channelsSetting.facebook.user;
export const selectPages = ({ channelsSetting }) => channelsSetting.facebook.pages;

const facebookSlice = createSlice({
  name: 'channelsSetting/facebook',
  initialState: {
    user: null,
    pages: [],
  },
  reducers: {
    // newLineChannel: (state, action) => LineChannelModel(),
    logout: (state, action) => {
      state.user = null;
    },
  },
  extraReducers: {
    [getFacebookUser.pending]: (state, action) => {
      state.user = null;
    },
    [getFacebookUser.fulfilled]: (state, action) => {
      state.user = action.payload;
    },
    [getPageList.pending]: (state, action) => {
      state.pages = [];
    },
    [getPageList.fulfilled]: (state, action) => {
      state.pages = action.payload;
    },
  },
});

export const { logout } = facebookSlice.actions;

export default facebookSlice.reducer;
