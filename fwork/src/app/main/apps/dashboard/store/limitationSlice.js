import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getLimitation = createAsyncThunk(
  'DashboardApp/limitation/getLimitation',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { activationId } = getState().organization;
      const response = await axios.get(`/api/limitation/${activationId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const limitationData = await response.data;

      return limitationData;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Dashboard limitation data error', variant: 'error' }));
      throw error;
    }
  }
);

const limitationSlice = createSlice({
  name: 'DashboardApp/limitation',
  initialState: null,
  reducers: {},
  extraReducers: {
    [getLimitation.fulfilled]: (state, action) => action.payload,
  },
});

export const selectLimitation = ({ DashboardApp }) => DashboardApp.limitation;

export default limitationSlice.reducer;
