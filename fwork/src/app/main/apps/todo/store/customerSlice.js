import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';

import { getChat, getChats } from './chatSlice';
import { closeMobileChatsSidebar } from './sidebarsSlice';
import { getHistories, getHistory } from './historySlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getCustomer = createAsyncThunk(
  'todoApp/customers/getCustomer',
  async ({ customerId, isMobile }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      if (!customerId) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/customer`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: customerId,
        },
      });
      const customer = await response.data;

      if (isMobile) {
        dispatch(closeMobileChatsSidebar());
      }
      return customer;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Customer error', variant: 'error' }));
      return null;
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'todoApp/customers/updateCustomer',
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
      const { selected, selectType, listType } = getState().scrumboardApp.current;
      if (selectType === 'chat') {
        dispatch(getChat({ chatId: selected.id }));
        dispatch(getChats(listType));
      }
      if (selectType === 'history') {
        dispatch(getHistory({ historyId: selected.id }));
        dispatch(getHistories());
      }

      dispatch(showMessage({ message: 'Customer Updated', variant: 'success' }));
      return customerResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Customer error', variant: 'error' }));
      return null;
    }
  }
);

const customerSlice = createSlice({
  name: 'foxTodoApp/customers',
  initialState: {
    customer: null,
  },
  reducers: {
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
  },
  extraReducers: {
    [getCustomer.fulfilled]: (state, action) => {
      state.customer = action.payload;
    },
    [updateCustomer.fulfilled]: (state, action) => {
      state.customer = action.payload;
    },
  },
});

export const { setCustomer } = customerSlice.actions;

export default customerSlice.reducer;
