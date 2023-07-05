import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import history from '@history';
import ActivationModel from '../model/ActivationModel';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getActivation = createAsyncThunk(
  'packagesApp/activation/getActivation',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/activation/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      return data;
    } catch (error) {
      history.push({ pathname: `/packages` });
      return null;
    }
  }
);

export const addActivation = createAsyncThunk(
  'packagesApp/activation/addActivation',
  async (activation, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    const response = await axios.post(`/api/activation`, activation, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const activationResult = await response.data;

    return activationResult;
  }
);

export const updateActivation = createAsyncThunk(
  'packagesApp/activation/updateActivation',
  async (activation, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    const response = await axios.put(`/api/activation`, activation, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const activationResult = await response.data;

    return activationResult;
  }
);

export const selectActivation = ({ packagesApp }) => packagesApp.activation;

const activationSlice = createSlice({
  name: 'packagesApp/activation',
  initialState: null,
  reducers: {
    newActivation: (state, action) => ActivationModel(),
    resetActivation: () => null,
  },
  extraReducers: {
    [getActivation.pending]: (state, action) => null,
    [getActivation.fulfilled]: (state, action) => action.payload,
    // [updateActivation.fulfilled]: (state, action) => action.payload,
  },
});
export const { newActivation, resetActivation } = activationSlice.actions;

export default activationSlice.reducer;
