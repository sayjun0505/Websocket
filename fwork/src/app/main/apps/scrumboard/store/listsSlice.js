import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import ListModel from '../model/ListModel';
import { getChats } from './chatsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Get Board Lists
 */
export const getLists = createAsyncThunk(
  'scrumboardApp/lists/getLists',
  async (boardId, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/scrumboard/board/${boardId}/lists`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    dispatch(getChats(boardId));
    return data;
  }
);

/**
 * Create List
 */
export const newList = createAsyncThunk(
  'scrumboardApp/lists/new',
  async (list, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.post(
      `/api/${organizationId}/scrumboard/board/${board.id}/list`,
      { data: ListModel(list) },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;

    // console.log('[newList] ', data);
    dispatch(getChats(board.id));

    return data;
  }
);

/**
 * Update list
 */
export const updateList = createAsyncThunk(
  'scrumboardApp/lists/updateList',
  async ({ id, newData }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.put(
      `/api/${organizationId}/scrumboard/board/${board.id}/list/${id}`,
      { data: newData },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;
    // console.log('[updateList] ', data);
    dispatch(getChats(board.id));

    return data;
  }
);

/**
 * Remove list
 */
export const removeList = createAsyncThunk(
  'scrumboardApp/lists/removeList',
  async (id, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.delete(
      `/api/${organizationId}/scrumboard/board/${board.id}/list/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await response.data;

    return id;
  }
);

export const getCustomerLabelOption = createAsyncThunk(
  'scrumboardApp/lists/getCustomerLabelOption',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/customer/label/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const labelOption = await response.data;
      return labelOption;
    } catch (error) {
      return [];
    }
  }
);

const listsAdapter = createEntityAdapter({});

export const { selectAll: selectLists, selectById: selectListById } = listsAdapter.getSelectors(
  (state) => state.scrumboardApp.lists
);

const listsSlice = createSlice({
  name: 'scrumboardApp/lists',
  initialState: listsAdapter.getInitialState({
    labelOption: [],
  }),
  reducers: {
    resetLists: (state, action) => {},
  },
  extraReducers: {
    [getLists.fulfilled]: listsAdapter.setAll,
    [updateList.fulfilled]: listsAdapter.setOne,
    [removeList.fulfilled]: listsAdapter.removeOne,
    [newList.fulfilled]: listsAdapter.addOne,
    [getCustomerLabelOption.fulfilled]: (state, action) => {
      state.labelOption = action.payload;
    },
  },
});

export const { resetLists } = listsSlice.actions;

export default listsSlice.reducer;
