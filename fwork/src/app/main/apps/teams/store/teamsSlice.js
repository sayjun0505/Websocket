import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseUtils from '@fuse/utils';
import { addTeam, removeTeam, updateTeam } from './teamSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTeams = createAsyncThunk(
  'teamsApp/teams/getTeams',
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
      // const teams = await response.data;
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Team List error', variant: 'error' }));
      throw error;
    }
  }
);

const teamsAdapter = createEntityAdapter({});

export const selectSearchText = ({ teamsApp }) => teamsApp.teams.searchText;

export const { selectAll: selectTeams, selectById: selectTeamsById } = teamsAdapter.getSelectors(
  (state) => state.teamsApp.teams
);

export const selectFilteredTeams = createSelector(
  [selectTeams, selectSearchText],
  (teams, searchText) => {
    if (searchText.length === 0) {
      return teams;
    }
    return FuseUtils.filterArrayByString(teams, searchText);
  }
);

export const selectGroupedFilteredTeams = createSelector([selectFilteredTeams], (teams) => {
  return teams
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
    .reduce((r, e) => {
      // get first letter of name of current element
      const group = e.name[0];
      // if there is no property in accumulator with this letter create it
      if (!r[group]) r[group] = { group, children: [e] };
      // if there is push current element to children array for that letter
      else r[group].children.push(e);
      // return accumulator
      return r;
    }, {});
});

const teamsSlice = createSlice({
  name: 'teamsApp/teams',
  initialState: teamsAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setTeamsSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    setTeamsforSocket: (state, action) => {
      const { data, routeParams } = action.payload;
      teamsAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
  extraReducers: {
    [updateTeam.fulfilled]: teamsAdapter.upsertOne,
    [addTeam.fulfilled]: teamsAdapter.addOne,
    [removeTeam.fulfilled]: (state, action) => teamsAdapter.removeOne(state, action.payload),
    [getTeams.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      teamsAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
});

export const { setTeamsSearchText,setTeamsforSocket } = teamsSlice.actions;

export default teamsSlice.reducer;
