import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getLabelOptions = createAsyncThunk(
  'chatApp/labels/getLabelOptions',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/chat/labelOptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.data;

    return data;
  }
);
export const getLabelOptionsforSocket = createAsyncThunk(
  'chatApp/labels/getLabelOptions',
  async (params, { dispatch, getState }) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    // const response = await axios.get(`/api/${organizationId}/chat/labelOptions`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    // const data = await response.data;

    return params;
  }
);

const labelsAdapter = createEntityAdapter({});

export const { selectAll: selectLabels, selectById: selectLabelById } = labelsAdapter.getSelectors(
  (state) => state.chatApp.labels
);

const labelsSlice = createSlice({
  name: 'chatApp/labels',
  initialState: labelsAdapter.getInitialState(),
  reducers:{
    setLabelOptionsforSocket:(state, action) => {
      labelsAdapter.setAll(state, action.payload)
    },
  },
  extraReducers: {
    [getLabelOptions.fulfilled]: labelsAdapter.setAll,
    [getLabelOptionsforSocket.fulfilled]: labelsAdapter.setAll,
  },
});
export const { setLabelOptionsforSocket} =  labelsSlice.actions;
export default labelsSlice.reducer;
