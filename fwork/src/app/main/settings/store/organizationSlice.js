import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getOrganization = createAsyncThunk(
  'generalSetting/getOrganization',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/organization/${organizationId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const organization = await response.data;
      return organization;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Organization error', variant: 'error' }));
      throw error;
    }
  }
);

export const getWorkingHours = createAsyncThunk(
  'generalSetting/getWorkingHours',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/organization/${organizationId}/workingHours`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const organization = await response.data;
      return organization;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Organization error', variant: 'error' }));
      throw error;
    }
  }
);

export const getMotopress = createAsyncThunk(
  'generalSetting/getMotopress',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/organization/${organizationId}/motopress`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const organization = await response.data;
      return organization;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Organization error', variant: 'error' }));
      throw error;
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'generalSetting/updateOrganization',
  async (organization, { dispatch, getState }) => {
    // console.log('[updateOrganization] ', organization);
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.put(
        `/api/organization`,
        { organization },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      dispatch(getOrganization());
      dispatch(showMessage({ message: 'Setting saved', variant: 'success' }));
      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Organization error', variant: 'error' }));
      throw error;
    }
  }
);

const initialState = {};

const organizationSlice = createSlice({
  name: 'generalSetting',
  initialState,
  reducers: {},
  extraReducers: {
    [getOrganization.pending]: (state, action) => null,
    [getOrganization.fulfilled]: (state, action) => action.payload,

    [getWorkingHours.pending]: (state, action) => null,
    [getWorkingHours.fulfilled]: (state, action) => action.payload,

    [getMotopress.pending]: (state, action) => null,
    [getMotopress.fulfilled]: (state, action) => action.payload,
    // [updateOrganization.fulfilled]: (state, action) => action.payload,
  },
});
export const selectOrganization = ({ Settings }) => Settings.organization;

export default organizationSlice.reducer;
