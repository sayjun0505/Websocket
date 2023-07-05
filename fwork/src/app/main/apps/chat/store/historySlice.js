import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getHistory = createAsyncThunk(
  'chatApp/history/getHistory',
  async ({ customerId }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    try {
      const response = await axios.get(`/api/${organizationId}/chat/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: customerId,
        },
      });

      const data = await response.data;

      return data;
    } catch (error) {
      // console.error('Get Chat History error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat History error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

const historySlice = createSlice({
  name: 'chatApp/history',
  initialState: null,
  reducers: {
    removeHistory: (state, action) => action.payload,
  },
  extraReducers: {
    [getHistory.fulfilled]: (state, action) => action.payload,
  },
});

export const selectHistory = ({ chatApp }) => chatApp.history;

export default historySlice.reducer;
