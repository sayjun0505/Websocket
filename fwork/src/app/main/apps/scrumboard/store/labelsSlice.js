import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import LabelModel from '../model/LabelModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getLabels = createAsyncThunk(
  'scrumboardApp/labels/getLabels',
  async (boardId, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/scrumboard/board/${boardId}/labels`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;

    return data;
  }
);

export const newLabel = createAsyncThunk(
  'scrumboardApp/labels/newLabel',
  async ({ newData }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.post(
      `/api/${organizationId}/scrumboard/board/${board.id}/label`,
      { data: LabelModel(newData) },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.data;

    return data;
  }
);

const labelsAdapter = createEntityAdapter({});

export const { selectAll: selectLabels, selectById: selectLabelById } = labelsAdapter.getSelectors(
  (state) => state.scrumboardApp.labels
);

const labelsSlice = createSlice({
  name: 'scrumboardApp/labels',
  initialState: labelsAdapter.getInitialState({}),
  reducers: {
    resetLabels: (state, action) => {},
  },
  extraReducers: {
    [getLabels.fulfilled]: labelsAdapter.setAll,
    [newLabel.fulfilled]: labelsAdapter.addOne,
  },
});

export const { resetLabels } = labelsSlice.actions;

export default labelsSlice.reducer;
