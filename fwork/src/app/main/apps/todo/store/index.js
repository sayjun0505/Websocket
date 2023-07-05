import { combineReducers } from '@reduxjs/toolkit';
import filters from './filtersSlice';
import folders from './foldersSlice';
import labels from './labelsSlice';
import todos from './todosSlice';
import sidebars from './sidebarsSlice';
import current from './currentSlice';
import chat from './chatSlice';
import reply from './replySlice';
import history from './historySlice';
import customer from './customerSlice';

const reducer = combineReducers({
  todos,
  folders,
  labels,
  filters,
  sidebars,
  current,
  chat,
  reply,
  history,
  customer,
});

export default reducer;
