import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import history from '@history';
import _ from '@lodash';
import { showMessage } from 'app/store/fuse/messageSlice';
import reorder, { reorderQuoteMap } from './reorder';
import { removeCard } from './cardSlice';
import { newList, removeList, updateList } from './listsSlice';
import { newCard } from './cardsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Get Board
 */
export const getBoard = createAsyncThunk(
  'scrumboardApp/board/getBoard',
  async (boardId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/scrumboard/board/${boardId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      // console.log('[getBoard] ', data);
      return data;
    } catch (error) {
      dispatch(
        showMessage({
          message: error.response.data,
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      );

      history.push({
        pathname: '/apps/kanbanboard/boards',
      });
      return null;
    }
  }
);

/**
 * Update Board
 */
export const updateBoard = createAsyncThunk(
  'scrumboardApp/board/update',
  async (newData, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.put(
      `/api/${organizationId}/scrumboard/board/${board.id}`,
      { data: newData },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;
    // console.log('[updateBoard] ', data);

    return data;
  }
);

/**
 * Reorder Board List
 */
export const reorderList = createAsyncThunk(
  'scrumboardApp/board/reorderList',
  async (result, { dispatch, getState }) => {
    const { board } = getState().scrumboardApp;
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { lists } = board;

    const ordered = reorder(_.merge([], lists), result.source.index, result.destination.index);

    // console.log('[List] ordered ', ordered);
    const response = await axios.put(
      `/api/${organizationId}/scrumboard/board/${board.id}/lists/reorder`,
      // {
      //   data: ordered.map((list, index) => ({
      //     id: list.id,
      //     orderIndex: index,
      //   })),
      // },
      {
        data: ordered,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;

    // dispatch(
    //   showMessage({
    //     message: 'List Order Saved',
    //     autoHideDuration: 2000,
    //     anchorOrigin: {
    //       vertical: 'top',
    //       horizontal: 'right',
    //     },
    //   })
    // );

    return {
      ...board,
      lists: data,
    };
  }
);

/**
 * Reorder Board Card
 */
export const reorderCard = createAsyncThunk(
  'scrumboardApp/board/reorderCard',
  async ({ source, destination, draggableId }, { dispatch, getState }) => {
    const { board } = getState().scrumboardApp;
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { lists } = board;
    // console.log('[Card] source ', source);
    // console.log('[Card] destination ', destination);

    const ordered = reorderQuoteMap(_.merge([], lists), source, destination);
    // console.log('[Card] ordered ', ordered);

    const response = await axios.put(
      `/api/${organizationId}/scrumboard/board/${board.id}/cards/reorder`,
      {
        data: ordered,
        changeData: {
          cardId: draggableId,
          listSourceId: source.droppableId,
          listDestinationId: destination.droppableId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;

    dispatch(
      showMessage({
        message: 'Card Order Saved',
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })
    );

    return {
      ...board,
      lists: data,
    };
  }
);

/**
 * Delete Board
 */
export const deleteBoard = createAsyncThunk(
  'scrumboardApp/board/delete',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.delete(`/api/${organizationId}/scrumboard/board/${board.id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    history.push({
      pathname: '/apps/kanbanboard/boards',
    });

    const data = await response.data;

    return data;
  }
);

const boardsSlice = createSlice({
  name: 'scrumboardApp/boards',
  initialState: null,
  reducers: {
    resetBoard: (state, action) => null,
    addLabel: (state, action) => {
      state.labels = [...state.labels, action.payload];
    },
  },
  extraReducers: {
    [getBoard.fulfilled]: (state, action) => action.payload,
    [updateBoard.fulfilled]: (state, action) => action.payload,
    [reorderList.fulfilled]: (state, action) => action.payload,
    [reorderCard.fulfilled]: (state, action) => action.payload,
    [deleteBoard.fulfilled]: (state, action) => {
      state = {};
    },
    [removeCard.fulfilled]: (state, action) => {
      const cardId = action.payload;

      state.lists = state.lists.map((list) => ({
        ...list,
        cards: _.reject(list.cards, (id) => id === cardId),
      }));
    },
    [removeList.fulfilled]: (state, action) => {
      const listId = action.payload;

      state.lists = _.reject(state.lists, { id: listId });
    },
    [newList.fulfilled]: (state, action) => {
      state.lists = [...state.lists, { id: action.payload.id, cards: action.payload.cards || [] }];
    },
    [updateList.fulfilled]: (state, action) => {
      // console.log('[card] ', action.payload.cards);
      const cards = action.payload.cards ? action.payload.cards : [];
      state.lists = state.lists.map((list) => {
        if (action.payload.id === list.id) {
          return {
            id: list.id,
            cards,
          };
        }
        return list;
      });
      // state.lists = [
      //   ...state.lists.filter((list) => list.id !== action.payload.id),
      //   { id: action.payload.id, cards },
      // ];
    },
    [newCard.fulfilled]: (state, action) => {
      const cardData = action.payload;
      // console.log('[cardData] ', cardData);
      state.lists = state.lists.map((list) => {
        // console.log('[#list] ', list);
        return list.id === cardData.listId
          ? { ...list, cards: [...list.cards, cardData.id] }
          : list;
      });
    },
  },
});

export const { resetBoard, addLabel } = boardsSlice.actions;

export const selectBoard = ({ scrumboardApp }) => scrumboardApp.board;

export default boardsSlice.reducer;
