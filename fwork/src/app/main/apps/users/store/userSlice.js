import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import history from '@history';
import { setUserData } from 'app/store/userSlice';
import UserModel from '../model/UserModel';
import { getUsers } from './usersSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getUser = createAsyncThunk(
  'usersApp/users/getUser',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/user`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          id,
        },
      });
      const user = await response.data;
      return user;
    } catch (error) {
      dispatch(showMessage({ message: 'Get User error', variant: 'error' }));
      history.push({ pathname: `/settings/users` });
      return null;
    }
  }
);

export const addUser = createAsyncThunk(
  'usersApp/users/addUser',
  async ({ email, role }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/user/organization`,
        { email, role },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const user = await response.data;
      dispatch(getUsers());
      history.push({ pathname: `/settings/users` });
      return user;
    } catch (error) {
      dispatch(showMessage({ message: 'Add User error', variant: 'error' }));
      history.push({ pathname: `/settings/users` });
      return null;
    }
  }
);

export const removeUser = createAsyncThunk(
  'usersApp/users/removeUser',
  async (user, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/user/organization`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: { id: user.user.id },
      });
      dispatch(getUsers());
      return user;
    } catch (error) {
      dispatch(showMessage({ message: 'Get User error', variant: 'error' }));
      history.push({ pathname: `/settings/users` });
      return null;
    }
  }
);

export const updateUser = createAsyncThunk(
  'usersApp/users/updateUser',
  async (user, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { uuid } = getState().user;
      const response = await axios.put(`/api/${organizationId}/user`, user, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const userResult = await response.data;
      // console.log('userResult : ', userResult);
      // console.log('user : ', user);
      const organizationUserData =
        userResult.organizationUser && userResult.organizationUser.length
          ? userResult.organizationUser.find((orgUser) => orgUser.organizationId === organizationId)
          : null;
      if (userResult.id === uuid) {
        dispatch(
          setUserData({
            display: userResult.display,
            picture: userResult.picture,
            email: userResult.email,
          })
        );
      }
      dispatch(getUsers());
      dispatch(getUser(user.user.id));
      dispatch(
        showMessage({
          message: 'User Updated',
          variant: 'success',
        })
      );
      return userResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update User error', variant: 'error' }));
      throw error;
    }
  }
);

export const selectUser = ({ usersApp }) => usersApp.user;

const userSlice = createSlice({
  name: 'usersApp/user',
  initialState: null,
  reducers: {
    newUser: (state, action) => UserModel(),
    resetUser: () => null,
  },
  extraReducers: {
    [getUser.pending]: (state, action) => null,
    [getUser.fulfilled]: (state, action) => action.payload,
    // [updateUser.fulfilled]: (state, action) => action.payload,
  },
});

export const { resetUser, newUser } = userSlice.actions;

export default userSlice.reducer;
