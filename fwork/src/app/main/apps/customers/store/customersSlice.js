import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseUtils from '@fuse/utils';
import { updateCustomer } from './customerSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getCustomers = createAsyncThunk(
  'customersApp/customers/getCustomers',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/customer/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Customer List error', variant: 'error' }));
      throw error;
    }
  }
);
export const getCustomersforSocket = createAsyncThunk(
  'customersApp/customers/getCustomers',
  async (params, { dispatch, getState }) => {
    try {
      return params;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Customer List error', variant: 'error' }));
      throw error;
    }
  }
);

const customersAdapter = createEntityAdapter({});

export const selectSearchText = ({ customersApp }) => customersApp.customers.searchText;

export const { selectAll: selectCustomers, selectById: selectCustomersById } =
  customersAdapter.getSelectors((state) => state.customersApp.customers);

export const selectFilteredCustomers = createSelector(
  [selectCustomers, selectSearchText],
  (customers, searchText) => {
    if (searchText.length === 0) {
      return customers;
    }
    return FuseUtils.filterArrayByString(customers, searchText);
  }
);

export const selectGroupedFilteredCustomers = createSelector(
  [selectFilteredCustomers],
  (customers) => {
    return customers
      .sort((a, b) => a.display.localeCompare(b.display, 'es', { sensitivity: 'base' }))
      .reduce((r, e) => {
        // get first letter of name of current element
        const group = e.display[0];
        // if there is no property in accumulator with this letter create it
        if (!r[group]) r[group] = { group, children: [e] };
        // if there is push current element to children array for that letter
        else r[group].children.push(e);
        // return accumulator
        return r;
      }, {});
  }
);

const customersSlice = createSlice({
  name: 'customersApp/customers',
  initialState: customersAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setCustomersSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [updateCustomer.fulfilled]: customersAdapter.upsertOne,
    [getCustomers.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      customersAdapter.setAll(state, data);
      state.searchText = '';
    },
    [getCustomersforSocket.fulfilled]: (state, action) =>{
      customersAdapter.setAll;
      state.searchText = '';
    },
  },
});

export const { setCustomersSearchText } = customersSlice.actions;

export default customersSlice.reducer;
