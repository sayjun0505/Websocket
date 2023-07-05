import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { updateNavigationItem } from './fuse/navigationSlice';
import firebaseAuthService from '../auth/services/firebaseService/firebaseAuthService';

export const getOrganization = createAsyncThunk(
  'organization/getOrganization',
  async (organizationId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
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

export const getPackage = createAsyncThunk(
  'organization/getPackage',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { activationId } = getState().organization;

      // console.log('getPackage', activationId);
      const response = await axios.get(`/api/activation/${activationId}/package`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const organizationPackage = await response.data;
      return organizationPackage;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Package error', variant: 'error' }));
      throw error;
    }
  }
);

export const getOrganizationState = createAsyncThunk(
  'organization/getOrganizationState',
  async (organizationId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/organization/${organizationId}/state`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const isRead = await response.data;
      // console.log("org",isRead)
      if (isRead.isRead.teamChat > 0) {
        dispatch(
          updateNavigationItem('apps.teamchat', {
            badge: {
              title: isRead.isRead.teamChat,
              bg: '#8180E7',
              fg: '#FFFFFF',
            },
          })
        );
      } else {
        dispatch(
          updateNavigationItem('apps.teamchat', {
            badge: null,
          })
        );
      }
    } catch (error) {
      dispatch(showMessage({ message: 'Get Organization error', variant: 'error' }));
      throw error;
    }
  }
);
export const getOrganizationStateforSocket = createAsyncThunk(
  'organization/getOrganizationState',
  async (isRead, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // const response = await axios.get(`/api/organization/${organizationId}/state`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const isRead = await response.data;
      // console.log("org",isRead)
      if (isRead.isRead.teamChat > 0) {
        dispatch(
          updateNavigationItem('apps.teamchat', {
            badge: {
              title: isRead.isRead.teamChat,
              bg: '#8180E7',
              fg: '#FFFFFF',
            },
          })
        );
      } else {
        dispatch(
          updateNavigationItem('apps.teamchat', {
            badge: null,
          })
        );
      }
    } catch (error) {
      dispatch(showMessage({ message: 'Get Organization error', variant: 'error' }));
      throw error;
    }
  }
);






const initialState = {};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    clearOrganization: (state, action) => initialState,
    setOrganization: (state, action) => action.payload,
  },
  extraReducers: {
    [getOrganization.fulfilled]: (state, action) => action.payload,
    [getPackage.fulfilled]: (state, action) => {
      state.package = action.payload;
    },
    [getOrganizationState.fulfilled]: (state, action) => {
      state.isRead = action.payload;
    },
    [getOrganizationStateforSocket.fulfilled]: (state, action) => {
      state.isRead = action.payload;
    },
  },
});
export const selectOrganization = ({ organization }) => organization;

export const { clearOrganization, setOrganization } = organizationSlice.actions;

export default organizationSlice.reducer;
