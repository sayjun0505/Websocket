import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseUtils from '@fuse/utils';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';
// import { updateUser } from './userSlice';

export const getUsers = createAsyncThunk(
  'usersApp/users/getUsers',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/user/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Users error', variant: 'error' }));
      throw error;
    }
  }
);

export const getSeats = createAsyncThunk(
  'usersApp/users/getSeats',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { activationId } = getState().organization;
      const response = await axios.get(`/api/activation/${activationId}/seat`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Seats error', variant: 'error' }));
      throw error;
    }
  }
);

const usersAdapter = createEntityAdapter({});

export const selectSearchText = ({ usersApp }) => usersApp.users.searchText;
export const selectSeats = ({ usersApp }) => usersApp.users.seats;

export const { selectAll: selectUsers, selectById: selectUsersById } = usersAdapter.getSelectors(
  (state) => state.usersApp.users
);

export const selectFilteredUsers = createSelector(
  [selectUsers, selectSearchText],
  (users, searchText) => {
    if (searchText.length === 0) {
      return users;
    }
    return FuseUtils.filterArrayByString(users, searchText);
  }
);

export const selectGroupedFilteredUsers = createSelector([selectFilteredUsers], (users) => {
  console.log('[selectGroupedFilteredUsers] ', users);
  return users
    .sort((a, b) => a.user.display.localeCompare(b.user.display, 'es', { sensitivity: 'base' }))
    .reduce((r, e) => {
      // get first letter of name of current element
      const group = e.user.display[0];
      // if there is no property in accumulator with this letter create it
      if (!r[group]) r[group] = { group, children: [e] };
      // if there is push current element to children array for that letter
      else r[group].children.push(e);
      // return accumulator
      return r;
    }, {});
});

const usersSlice = createSlice({
  name: 'usersApp/users',
  initialState: usersAdapter.getInitialState({
    searchText: '',
    seats: 0,
  }),
  reducers: {
    setUsersSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    // [updateUser.fulfilled]: usersAdapter.upsertOne,
    [getSeats.fulfilled]: (state, action) => {
      state.seats = action.payload.freeSeat;
    },
    [getUsers.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      usersAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
});

export const { setUsersSearchText } = usersSlice.actions;

export default usersSlice.reducer;
