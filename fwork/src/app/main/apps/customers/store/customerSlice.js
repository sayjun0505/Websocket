import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import history from '@history';
import CustomerModel from '../model/CustomerModel';
import { getCustomerLabels } from './labelsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getCustomer = createAsyncThunk(
  'customersApp/customers/getCustomer',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/customer`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id,
        },
      });
      const customer = await response.data;
      return customer;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Customer error', variant: 'error' }));
      history.push({ pathname: `/apps/customers` });
      return null;
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customersApp/customers/updateCustomer',
  async (customer, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/customer`,
        { customer },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const customerResult = await response.data;
      dispatch(
        showMessage({
          message: 'Customer Updated',
          variant: 'success',
        })
      );
      dispatch(getCustomerLabels());
      setCustomer(customerResult);

      return customerResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Customer error', variant: 'error' }));
      throw error;
    }
  }
);

export const selectCustomer = ({ customersApp }) => customersApp.customer;

const customerSlice = createSlice({
  name: 'customersApp/customer',
  initialState: null,
  reducers: {
    newCustomer: (state, action) => CustomerModel(),
    resetCustomer: () => null,
    setCustomer: (state, action) => action.payload,
  },
  extraReducers: {
    [getCustomer.pending]: (state, action) => null,
    [getCustomer.fulfilled]: (state, action) => action.payload,
    [updateCustomer.fulfilled]: (state, action) => action.payload,
  },
});

export const { resetCustomer, newCustomer, setCustomer } = customerSlice.actions;

export default customerSlice.reducer;
