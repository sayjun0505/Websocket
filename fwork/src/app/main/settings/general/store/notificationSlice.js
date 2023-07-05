import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getSetting = createAsyncThunk(
  'generalSetting/notification/getSetting',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/notification/setting`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const setting = await response.data;
      return setting;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Notification setting error', variant: 'error' }));
      throw error;
    }
  }
);

export const saveSetting = createAsyncThunk(
  'generalSetting/notification/saveSetting',
  async (setting, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.put(`/api/notification/setting`, setting, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const userSetting = await response.data;
      dispatch(
        showMessage({
          message: 'Notification setting Updated!',
          variant: 'success',
        })
      );
      return userSetting;
    } catch (error) {
      // console.error('[generalSetting/notification/saveSetting] ', error);
      dispatch(
        showMessage({
          message: 'Update user notification setting error!',
          autoHideDuration: 3000,
          variant: 'error',
        })
      );
      return {};
    }
  }
);

const notificationSlice = createSlice({
  name: 'generalSetting/notification',
  initialState: {},
  reducers: {},
  extraReducers: {
    [getSetting.fulfilled]: (state, action) => action.payload,
    [saveSetting.fulfilled]: (state, action) => action.payload,
  },
});
export const selectSetting = ({ generalSetting }) => generalSetting.notification;

export default notificationSlice.reducer;
