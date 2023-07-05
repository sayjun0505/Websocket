import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { getCustomer } from './customerSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const updateAddress = createAsyncThunk(
  'chatApp/address/updateAddress',
  async (address, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { customer } = getState().chatApp;
      const response = await axios.put(
        `/api/${organizationId}/customer/address`,
        { address },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const addressResult = await response.data;
      dispatch(getCustomer({ customerId: customer.id }));

      dispatch(
        showMessage({
          message: 'Address Updated',
          variant: 'success',
        })
      );

      return addressResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Customer Address error', variant: 'error' }));
      throw error;
    }
  }
);

export const addAddress = createAsyncThunk(
  'chatApp/address/addAddress',
  async (address, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { customer } = getState().chatApp;
      const response = await axios.post(
        `/api/${organizationId}/customer/address`,
        {
          address: {
            ...address,
            customer,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const addressResult = await response.data;
      dispatch(getCustomer({ customerId: customer.id }));
      dispatch(
        showMessage({
          message: 'Address Created',
          variant: 'success',
        })
      );

      return addressResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Create Customer Address error', variant: 'error' }));
      throw error;
    }
  }
);

export const removeAddress = createAsyncThunk(
  'chatApp/address/removeAddress',
  async (address, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { customer } = getState().chatApp;
      const response = await axios.delete(`/api/${organizationId}/customer/address`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: address.id,
        },
      });
      const addressResult = await response.data;
      dispatch(getCustomer({ customerId: customer.id }));
      dispatch(
        showMessage({
          message: 'Address Removed',
          variant: 'success',
        })
      );

      return addressResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Remove Customer Address error',
          variant: 'error',
        })
      );
      throw error;
    }
  }
);

const addressAdapter = createEntityAdapter({});

export const { selectAll: selectAddress, selectById: selectAddressById } =
  addressAdapter.getSelectors((state) => state.customersApp.customers);

const addressSlice = createSlice({
  name: 'chatApp/address',
  initialState: addressAdapter.getInitialState({
    searchText: '',
    routeParams: {},
    addressDialog: {
      type: 'new',
      props: {
        open: false,
      },
      data: null,
    },
  }),
  reducers: {
    openNewAddressDialog: (state, action) => {
      state.addressDialog = {
        type: 'new',
        props: {
          open: true,
        },
        data: null,
      };
    },
    closeNewAddressDialog: (state, action) => {
      state.addressDialog = {
        type: 'new',
        props: {
          open: false,
        },
        data: null,
      };
    },
    openEditAddressDialog: (state, action) => {
      state.addressDialog = {
        type: 'edit',
        props: {
          open: true,
        },
        data: action.payload,
      };
    },
    closeEditAddressDialog: (state, action) => {
      state.addressDialog = {
        type: 'edit',
        props: {
          open: false,
        },
        data: null,
      };
    },
  },
});

export const {
  openNewAddressDialog,
  closeNewAddressDialog,
  openEditAddressDialog,
  closeEditAddressDialog,
} = addressSlice.actions;

export default addressSlice.reducer;
