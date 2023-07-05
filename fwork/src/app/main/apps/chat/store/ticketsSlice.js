import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTicketOptions = createAsyncThunk(
  'chatApp/tickets/getTicketOptions',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/chat/ticketOptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.data;

    return data;
  }
);

const ticketsAdapter = createEntityAdapter({});

export const { selectAll: selectTickets, selectById: selectTicketById } =
  ticketsAdapter.getSelectors((state) => state.chatApp.tickets);

const ticketsSlice = createSlice({
  name: 'chatApp/tickets',
  initialState: ticketsAdapter.getInitialState(),
  extraReducers: {
    [getTicketOptions.fulfilled]: ticketsAdapter.setAll,
  },
});

export default ticketsSlice.reducer;
