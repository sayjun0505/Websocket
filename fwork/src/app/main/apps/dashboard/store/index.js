import { combineReducers } from '@reduxjs/toolkit';

import limitation from './limitationSlice';
import widgets from './widgetsSlice';

const reducer = combineReducers({
  limitation,
  widgets,
});

export default reducer;
