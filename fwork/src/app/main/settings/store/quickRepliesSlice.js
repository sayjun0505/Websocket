import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import FuseUtils from '@fuse/utils';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';
import { updateQuickReplyStatus } from './quickReplySlice';

export const getQuickReplies = createAsyncThunk(
  'Settings/quickReplies/getQuickReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/reply/list/quick`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const replies = await response.data;
      // console.log('[getQuickReplies] ', replies);
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Quick Reply list error', variant: 'error' }));
      return null;
    }
  }
);

const quickRepliesAdapter = createEntityAdapter({});

export const selectSearchText = ({ Settings }) => Settings.quickReplies.searchText;

export const { selectAll: selectQuickReplies, selectById: selectQuickReplyById } =
  quickRepliesAdapter.getSelectors((state) => state.Settings.quickReplies);

export const selectFilteredQuickReplies = createSelector(
  [selectQuickReplies, selectSearchText],
  (channels, searchText) => {
    if (searchText.length === 0) {
      return channels;
    }
    return FuseUtils.filterArrayByString(channels, searchText).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
);

const quickRepliesSlice = createSlice({
  name: 'Settings/quickReplies',
  initialState: quickRepliesAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setQuickRepliesSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [getQuickReplies.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      quickRepliesAdapter.setAll(state, data);
      state.searchText = '';
    },
    [updateQuickReplyStatus.fulfilled]: quickRepliesAdapter.upsertOne,
  },
});

export const { setQuickRepliesSearchText } = quickRepliesSlice.actions;

export default quickRepliesSlice.reducer;
