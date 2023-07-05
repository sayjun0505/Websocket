import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTeams = createAsyncThunk(
  'usersApp/teams/getTeams',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/team/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const teamOption = await response.data;
      return teamOption;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Team Option', variant: 'error' }));
      return [];
    }
  }
);

const teamsAdapter = createEntityAdapter({});

export const { selectAll: selectTeams, selectById: selectTeamsById } = teamsAdapter.getSelectors(
  (state) => state.usersApp.teams
);

export const selectTeamsOption = createSelector([selectTeams], (teams) => {
  return teams.map((team) => {
    return { id: team.id, name: team.name };
  });
});

const teamsSlice = createSlice({
  name: 'usersApp/teams',
  initialState: teamsAdapter.getInitialState([]),
  reducers: {},
  extraReducers: {
    [getTeams.fulfilled]: teamsAdapter.setAll,
  },
});

export default teamsSlice.reducer;
