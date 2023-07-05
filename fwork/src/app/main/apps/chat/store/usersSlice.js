import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getUserOptions = createAsyncThunk(
  'chatApp/users/getUserOptions',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/chat/userOptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.data;

    return data;
  }
);
export const getUserOptionsforSocket = createAsyncThunk(
  'chatApp/users/getUserOptions',
  async (params, { dispatch, getState }) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    // const response = await axios.get(`/api/${organizationId}/chat/userOptions`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    // const data = await response.data;

    return params;
  }
);

const usersAdapter = createEntityAdapter({});

export const { selectAll: selectUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state) => state.chatApp.users
);

const usersSlice = createSlice({
  name: 'chatApp/users',
  initialState: usersAdapter.getInitialState(),
  reducers:{
    setUserOptionsforSocket:(state, action) => {
      usersAdapter.setAll(state, action.payload)
    },
  },
  extraReducers: {
    [getUserOptions.fulfilled]: usersAdapter.setAll,
    [getUserOptionsforSocket.fulfilled]: usersAdapter.setAll,
  },
});
export const { setUserOptionsforSocket} =  usersSlice.actions;
export default usersSlice.reducer;
