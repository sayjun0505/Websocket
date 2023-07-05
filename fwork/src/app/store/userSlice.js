/* eslint import/no-extraneous-dependencies: off */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import history from '@history';
import _ from '@lodash';
import { setInitialSettings } from 'app/store/fuse/settingsSlice';
// import { showMessage } from 'app/store/fuse/messageSlice';
import settingsConfig from 'app/configs/settingsConfig';
// import jwtService from '../auth/services/jwtService';
import axios from 'axios';
import firebaseAuthService from '../auth/services/firebaseService/firebaseAuthService';

export const setUser = createAsyncThunk('user/setUser', async (user, { dispatch, getState }) => {
  /*
    You can redirect the logged-in user to a specific route depending on his role
    */
  if (user.loginRedirectUrl) {
    settingsConfig.loginRedirectUrl = user.loginRedirectUrl; // for example 'apps/academy'
  }

  return user;
});

export const updateUserSettings = createAsyncThunk(
  'user/updateSettings',
  async (settings, { dispatch, getState }) => {
    const { user } = getState();
    const newUser = _.merge({}, user, { data: { settings } });

    dispatch(updateUserData(newUser));

    return newUser;
  }
);

export const updateUserShortcuts = createAsyncThunk(
  'user/updateShortucts',
  async (shortcuts, { dispatch, getState }) => {
    const { user } = getState();
    const newUser = {
      ...user,
      data: {
        ...user.data,
        shortcuts,
      },
    };

    dispatch(updateUserData(newUser));

    return newUser;
  }
);

export const logoutUser = () => async (dispatch, getState) => {
  const { user } = getState();

  if (!user.role || user.role.length === 0) {
    // is guest
    return null;
  }

  history.push({
    pathname: '/sign-in',
  });

  dispatch(setInitialSettings());

  return dispatch(userLoggedOut());
};

export const updateUserData = (user) => async (dispatch, getState) => {
  // if (!user.role || user.role.length === 0) {
  //   // is guest
  //   return;
  // }
  // jwtService
  //   .updateUserData(user)
  //   .then(() => {
  //     dispatch(showMessage({ message: 'User data saved with api' }));
  //   })
  //   .catch((error) => {
  //     dispatch(showMessage({ message: error.message }));
  //   });
};

export const changeTheme = createAsyncThunk(
  'user/changeTheme',
  async (theme, { dispatch, getState }) => {
    try {
      const current = getState().user.theme;
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/user/theme/${theme}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.data;
      // if (result.message === 'success') {
      //   dispatch(setTheme(theme));
      // } else {
      //   dispatch(setTheme(current));
      // }
      return true;
    } catch (error) {
      return false;
    }
  }
);

const initialState = {
  role: [], // guest
  data: {
    display: '',
    pictureURL: '',
    email: '',
    shortcuts: [],
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLoggedOut: (state, action) => initialState,
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setProfileImg: (state, action) => {
      state.data.pictureURL = action.payload;
    },

    setUserData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
  extraReducers: {
    [updateUserSettings.fulfilled]: (state, action) => action.payload,
    [updateUserShortcuts.fulfilled]: (state, action) => action.payload,
    [setUser.fulfilled]: (state, action) => action.payload,
  },
});

export const { userLoggedOut, setProfileImg, setRole, setTheme, setUserData } = userSlice.actions;

export const selectUser = ({ user }) => user;
export const selectUserRole = ({ user }) => user.role;

export const selectUserShortcuts = ({ user }) => user.data.shortcuts;

export default userSlice.reducer;
