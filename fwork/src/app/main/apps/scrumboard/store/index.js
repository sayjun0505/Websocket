import { combineReducers } from '@reduxjs/toolkit';
import board from './boardSlice';
import boards from './boardsSlice';
import card from './cardSlice';
import cards from './cardsSlice';
import chat from './chatSlice';
import chats from './chatsSlice';
import lists from './listsSlice';
import labels from './labelsSlice';
import members from './membersSlice';

const scrumboardAppReducers = combineReducers({
  boards,
  board,
  card,
  cards,
  chat,
  chats,
  lists,
  labels,
  members,
});

export default scrumboardAppReducers;
