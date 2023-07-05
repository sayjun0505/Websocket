import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getPayments = createAsyncThunk(
  'packagesApp/payments/getPayments',
  async (activationId, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const response = await axios.get(`/api/activation/${activationId}/payments`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;

    return { data };
  }
);

const paymentsAdapter = createEntityAdapter({});

export const selectSearchText = ({ packagesApp }) => packagesApp.payments.searchText;

export const { selectAll: selectPayments, selectById: selectPaymentsById } =
  paymentsAdapter.getSelectors((state) => state.packagesApp.payments);

const paymentsSlice = createSlice({
  name: 'packagesApp/payments',
  initialState: paymentsAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setPaymentsSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [getPayments.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      paymentsAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
});
export const { setPaymentsSearchText } = paymentsSlice.actions;

export default paymentsSlice.reducer;
