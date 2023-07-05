import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getPackages = createAsyncThunk('organizationsApp/packages/getPackages', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.get('/api/packages', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.data;

  return data;
});
export const getPackagesforSocket = createAsyncThunk('organizationsApp/packages/getPackages', async (data) => {
  // const token = await firebaseAuthService.getAccessToken();
  // const response = await axios.get('/api/packages', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // const data = await response.data;
// console.log("resr",res)
  return data;
});


const packagesAdapter = createEntityAdapter({});

export const { selectAll: selectPackages, selectById: selectPackagesById } =
  packagesAdapter.getSelectors((state) => state.organizationsApp.packages);

const packagesSlice = createSlice({
  name: 'organizationsApp/packages',
  initialState: packagesAdapter.getInitialState({}),
  reducers: {
    setPackagesforSocket:(state, action) => {
      packagesAdapter.setAll(state, action.payload)
    },
  },
  extraReducers: {
    [getPackages.fulfilled]: packagesAdapter.setAll,
    [getPackagesforSocket.fulfilled]: packagesAdapter.setAll,
  },
});
export const { setPackagesforSocket} = packagesSlice.actions;
export default packagesSlice.reducer;
