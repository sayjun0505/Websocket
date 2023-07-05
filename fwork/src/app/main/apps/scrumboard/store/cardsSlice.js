import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import _ from '@lodash';
import { removeList } from './listsSlice';
import { removeCard, updateCard } from './cardSlice';
import CardModel from '../model/CardModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getCards = createAsyncThunk(
  'scrumboardApp/cards/getCards',
  async (boardId, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const response = await axios.get(`/api/${organizationId}/scrumboard/board/${boardId}/cards`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    return data;
  }
);
export const getCardsforSocket = createAsyncThunk(
  'scrumboardApp/cards/getCards',
  async (data, { dispatch, getState }) => {
    return data;
  }
);

export const newCard = createAsyncThunk(
  'scrumboardApp/cards/newCard',
  async ({ listId, newData }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;

    const response = await axios.post(
      `/api/${organizationId}/scrumboard/board/${board.id}/list/${listId}/card`,
      { data: CardModel(newData) },
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

const cardsAdapter = createEntityAdapter({});

export const { selectAll: selectCards, selectById: selectCardById } = cardsAdapter.getSelectors(
  (state) => state.scrumboardApp.cards
);

const cardsSlice = createSlice({
  name: 'scrumboardApp/cards',
  initialState: cardsAdapter.getInitialState({}),
  reducers: {
    resetCards: (state, action) => {},
  },
  extraReducers: {
    [getCards.fulfilled]: cardsAdapter.setAll,
    [getCardsforSocket.fulfilled]: cardsAdapter.setAll,
    [removeList.fulfilled]: (state, action) => {
      const listId = action.payload;
      const { selectAll } = cardsAdapter.getSelectors();
      const cards = selectAll(state);
      const removedCardIds = _.map(_.filter(cards, { listId }), 'id');
      return cardsAdapter.removeMany(state, removedCardIds);
    },
    [newCard.fulfilled]: cardsAdapter.addOne,
    [updateCard.fulfilled]: cardsAdapter.setOne,
    [removeCard.fulfilled]: cardsAdapter.removeOne,
  },
});

export const { resetCards } = cardsSlice.actions;

export default cardsSlice.reducer;
