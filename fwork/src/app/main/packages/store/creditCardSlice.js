import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getCreditCards = createAsyncThunk(
  'packagesApp/creditCard/getCreditCards',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/creditCards`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;

      return { data };
    } catch (error) {
      return null;
    }
  }
);

export const addCreditCard = createAsyncThunk(
  'packagesApp/creditCard/addCreditCard',
  async (creditCard, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    const response = await axios.post(`/api/creditCard`, creditCard, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const creditCardResult = await response.data;

    return creditCardResult;
  }
);

export const removeCreditCard = createAsyncThunk(
  'packagesApp/creditCard/updateCreditCard',
  async (id, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    const response = await axios.delete(`/api/creditCard/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const creditCardResult = await response.data;

    return creditCardResult;
  }
);

const creditCardsAdapter = createEntityAdapter({});

export const { selectAll: selectCreditCard, selectById: selectCreditCardsById } =
  creditCardsAdapter.getSelectors((state) => state.packagesApp.creditCard);

const creditCardSlice = createSlice({
  name: 'packagesApp/creditCard',
  initialState: null,
  reducers: {
    resetCreditCard: () => null,
  },
  extraReducers: {
    [getCreditCards.pending]: (state, action) => null,
    [getCreditCards.fulfilled]: (state, action) => action.payload,
  },
});
export const { resetCreditCard } = creditCardSlice.actions;

export default creditCardSlice.reducer;
