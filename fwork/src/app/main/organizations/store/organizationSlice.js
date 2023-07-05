import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import history from '@history';
import { showMessage } from 'app/store/fuse/messageSlice';
import OrganizationModel from '../model/OrganizationModel';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getOrganization = createAsyncThunk(
  'organizationsApp/organization/getOrganization',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/organization/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      return data;
    } catch (error) {
      history.push({ pathname: `/organizations` });
      return null;
    }
  }
);

export const addOrganization = createAsyncThunk(
  'organizationsApp/organization/addOrganization',
  async (organization, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.post(
        `/api/organization`,
        { organization },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;

      console.log('[Add] organization ', data);
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Add organization error', variant: 'error' }));
      return null;
    }
  }
);
export const setStoreorga=createAsyncThunk(
  'organizationsApp/organization/addOrganization',
  async (organization, { dispatch, getState }) => {
    return organization;
  }
);
export const updateOrganization = createAsyncThunk(
  'organizationsApp/organization/addOrganization',
  async (organization, { dispatch, getState }) => {
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
      const data = await response.data;
      console.log('[Update] organization ', data);
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Add organization error', variant: 'error' }));
      return null;
    }
  }
);
export const acceptOrganizationforSocket = createAsyncThunk(
  'organizationsApp/organization/acceptOrganization',
  async (data, { dispatch, getState }) => {
    try {      
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Accept organization error', variant: 'error' }));
      return null;
    }
  }
);
export const acceptOrganization = createAsyncThunk(
  'organizationsApp/organization/acceptOrganization',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/organization/accept/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      // console.log('[acceptOrganization] ', data);
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Accept organization error', variant: 'error' }));
      return null;
    }
  }
);

export const selectOrganization = ({ organizationsApp }) => organizationsApp.organization;

const organizationSlice = createSlice({
  name: 'organizationsApp/organization',
  initialState: null,
  reducers: {
    newOrganization: (state, action) => OrganizationModel(state),
    resetOrganization: () => null,
    setStoreorg:(state, action) => action.payload,
  },
  extraReducers: {
    [getOrganization.pending]: (state, action) => null,
    [getOrganization.fulfilled]: (state, action) => action.payload,
    // [updateOrganization.fulfilled]: (state, action) => action.payload,
  },
});
export const { newOrganization, resetOrganization,setStoreorg } = organizationSlice.actions;

export default organizationSlice.reducer;
