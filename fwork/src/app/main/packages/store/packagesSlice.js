import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getPackages = createAsyncThunk('packagesApp/packages/getPackages', async () => {
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

const packagesAdapter = createEntityAdapter({});

export const { selectAll: selectPackages, selectById: selectPackagesById } =
  packagesAdapter.getSelectors((state) => state.packagesApp.packages);

export const selectSortPackage = createSelector([selectPackages], (packages) => {
  return packages.sort((a, b) => a.yearlyPrice - b.yearlyPrice);
});

const packagesSlice = createSlice({
  name: 'packagesApp/packages',
  initialState: packagesAdapter.getInitialState({}),
  reducers: {},
  extraReducers: {
    [getPackages.fulfilled]: packagesAdapter.setAll,
  },
});

export default packagesSlice.reducer;
