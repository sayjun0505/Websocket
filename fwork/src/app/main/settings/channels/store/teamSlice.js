import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import history from '@history';
// import TeamModel from '../model/TeamModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTeam = createAsyncThunk(
  'teamsApp/teams/getTeam',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/team/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const team = await response.data;
      return team;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Team error', variant: 'error' }));
      history.push({ pathname: `/settings/teams` });
      return null;
    }
  }
);

export const addTeam = createAsyncThunk(
  'setting/teams/addTeam',
  async (team, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(`/api/${organizationId}/team`, team, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const teamResult = await response.data;
      dispatch(
        showMessage({
          message: 'Team Added',
          variant: 'success',
        })
      );
      return teamResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Added Team error', variant: 'error' }));
      throw error;
    }
  }
);

export const updateTeam = createAsyncThunk(
  'setting/teams/updateTeam',
  async (team, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.put(`/api/${organizationId}/team`, team, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const teamResult = await response.data;
      dispatch(
        showMessage({
          message: 'Team Updated',
          variant: 'success',
        })
      );
      return teamResult;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Team error', variant: 'error' }));
      throw error;
    }
  }
);

export const removeTeam = createAsyncThunk(
  'teamsApp/teams/removeTeam',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/team/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(showMessage({ message: 'Team removed!', variant: 'success' }));
      return id;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove Team error', variant: 'error' }));
      throw error;
    }
  }
);

export const selectTeam = ({ teamsApp }) => teamsApp.team;

const teamSlice = createSlice({
  name: 'teamsApp/team',
  initialState: null,
  reducers: {
    // newTeam: (state, action) => TeamModel(),
    resetTeam: () => null,
  },
  extraReducers: {
    [getTeam.pending]: (state, action) => null,
    [getTeam.fulfilled]: (state, action) => action.payload,
    [updateTeam.fulfilled]: (state, action) => action.payload,
    [addTeam.fulfilled]: (state, action) => action.payload,
  },
});

export const { resetTeam, newTeam } = teamSlice.actions;

export default teamSlice.reducer;
