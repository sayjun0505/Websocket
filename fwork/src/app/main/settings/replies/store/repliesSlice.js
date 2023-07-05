import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import FuseUtils from '@fuse/utils';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getReplies = createAsyncThunk(
  'repliesSetting/replies/getReplies',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/reply/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const replies = await response.data;
      // console.log('[getReplies] ', replies);
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Reply list error', variant: 'error' }));
      return null;
    }
  }
);

const repliesAdapter = createEntityAdapter({});

export const selectSearchText = ({ repliesSetting }) => repliesSetting.replies.searchText;

export const { selectAll: selectReplies, selectById: selectReplyById } =
  repliesAdapter.getSelectors((state) => state.repliesSetting.replies);

export const selectFilteredReplies = createSelector(
  [selectReplies, selectSearchText],
  (channels, searchText) => {
    if (searchText.length === 0) {
      return channels;
    }
    return FuseUtils.filterArrayByString(channels, searchText);
  }
);

const repliesSlice = createSlice({
  name: 'repliesSetting/replies',
  initialState: repliesAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setRepliesSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [getReplies.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      repliesAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
});

export const { setRepliesSearchText } = repliesSlice.actions;

export default repliesSlice.reducer;
