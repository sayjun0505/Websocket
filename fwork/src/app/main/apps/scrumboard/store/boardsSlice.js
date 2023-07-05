import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import history from '@history';
import BoardModel from '../model/BoardModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Get Boards
 */
export const getBoards = createAsyncThunk(
  'scrumboardApp/boards/getBoards',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/scrumboard/boards`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;

    return data;
  }
);
export const getBoardsforSocket = createAsyncThunk(
  'scrumboardApp/boards/getBoards',
  async (data, { dispatch, getState }) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    // const response = await axios.get(`/api/${organizationId}/scrumboard/boards`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // const data = await response.data;

    return data;
  }
);

/**
 * Create New Board
 */
export const newBoard = createAsyncThunk(
  'scrumboardApp/boards/newBoard',
  async (board, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    const response = await axios.post(
      `/api/${organizationId}/scrumboard/board`,
      {
        board: BoardModel(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // const response = await axios.post('/api/scrumboard/boards', BoardModel(board));
    const data = await response.data;

    history.push({
      pathname: `/apps/kanbanboard/boards/${data.id}`,
    });

    return data;
  }
);
export const newBoardforSocket = createAsyncThunk(
  'scrumboardApp/boards/newBoard',
  async (data, { dispatch, getState }) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;

    // const response = await axios.post(
    //   `/api/${organizationId}/scrumboard/board`,
    //   {
    //     board: BoardModel(),
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );

    // // const response = await axios.post('/api/scrumboard/boards', BoardModel(board));
    // const data = await response.data;

    history.push({
      pathname: `/apps/kanbanboard/boards/${data.id}`,
    });

    return data;
  }
);

const boardsAdapter = createEntityAdapter({});

export const { selectAll: selectBoards, selectById: selectBoardById } = boardsAdapter.getSelectors(
  (state) => state.scrumboardApp.boards
);

const boardsSlice = createSlice({
  name: 'scrumboardApp/boards',
  initialState: boardsAdapter.getInitialState({
    isCompactView: true,
  }),
  reducers: {
    resetBoards: (state, action) => {},
    setCompactView: (state, action) => {
      state.isCompactView = action.payload;
    },
  },
  extraReducers: {
    [getBoards.fulfilled]: boardsAdapter.setAll,
    [getBoardsforSocket.fulfilled]: boardsAdapter.setAll,
  },
});

export const { resetBoards, setCompactView } = boardsSlice.actions;

export default boardsSlice.reducer;
