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
import { updateAutoReplyStatus } from './autoReplySlice';

export const getAutoReplies = createAsyncThunk(
  'Settings/autoReplies/getAutoReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/reply/list/auto`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const replies = await response.data;
      // console.log('[getAutoReplies] ', replies);
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Auto Reply list error', variant: 'error' }));
      return null;
    }
  }
);

const autoRepliesAdapter = createEntityAdapter({});

export const selectSearchText = ({ Settings }) => Settings.autoReplies.searchText;

export const { selectAll: selectAutoReplies, selectById: selectAutoReplyById } =
  autoRepliesAdapter.getSelectors((state) => state.Settings.autoReplies);

export const selectFilteredAutoReplies = createSelector(
  [selectAutoReplies, selectSearchText],
  (channels, searchText) => {
    if (searchText.length === 0) {
      return channels;
    }
    return FuseUtils.filterArrayByString(channels, searchText).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
);

const autoRepliesSlice = createSlice({
  name: 'Settings/autoReplies',
  initialState: autoRepliesAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setAutoRepliesSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [getAutoReplies.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      autoRepliesAdapter.setAll(state, data);
      state.searchText = '';
    },
    [updateAutoReplyStatus.fulfilled]: autoRepliesAdapter.upsertOne,
  },
});

export const { setAutoRepliesSearchText } = autoRepliesSlice.actions;

export default autoRepliesSlice.reducer;
