import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getInviteCode = createAsyncThunk('packagesApp/invite/getInviteCode', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.get('/api/activations/invite', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.data;

  return data;
});

const inviteAdapter = createEntityAdapter({});

export const selectSearchText = ({ packagesApp }) => packagesApp.activations.searchText;

export const { selectAll: selectInviteCode, selectById: selectInviteCodeById } =
  inviteAdapter.getSelectors((state) => state.packagesApp.invite);

const inviteCodeSlice = createSlice({
  name: 'packagesApp/invite',
  initialState: inviteAdapter.getInitialState({}),
  reducers: {},
  extraReducers: {
    [getInviteCode.fulfilled]: inviteAdapter.setAll,
  },
});

export default inviteCodeSlice.reducer;
