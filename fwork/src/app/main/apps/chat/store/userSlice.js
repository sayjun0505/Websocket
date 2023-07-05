import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getUserData = createAsyncThunk('chatApp/user/getUserData', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.get('/api/user/me', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.data;

  return data;
});

// export const getUserList = createAsyncThunk(
//   'chatApp/user/getUserList',
//   async (params, { dispatch, getState }) => {
//     const token = await firebaseAuthService.getAccessToken();
//     const { organizationId } = getState().organization;
//     const response = await axios.get(`/api/${organizationId}/user/list`, {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await response.data;

//     return data;
//   }
// );
const userSlice = createSlice({
  name: 'chatApp/user',
  initialState: null,
  extraReducers: {
    [getUserData.fulfilled]: (state, action) => action.payload,
    // [getUserList.fulfilled]: (state, action) => {
    //   state.userList = action.payload;
    // },
  },
});

export const selectUser = ({ chatApp }) => chatApp.user;

export default userSlice.reducer;
