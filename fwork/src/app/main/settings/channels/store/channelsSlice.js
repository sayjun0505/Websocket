import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseUtils from '@fuse/utils';
import {
  addFacebookChannel,
  addInstagramChannel,
  addLineChannel,
  removeFacebookChannel,
  removeInstagramChannel,
  removeLineChannel,
  updateLineChannel,
} from './channelSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChannels = createAsyncThunk(
  'channelsSetting/channels/getChannels',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/channel/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      // const channels = await response.data;
      return response;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Channel List error', variant: 'error' }));
      throw error;
    }
  }
);

const channelsAdapter = createEntityAdapter({});

export const selectSearchText = ({ channelsSetting }) => channelsSetting.channels.searchText;

export const { selectAll: selectChannels, selectById: selectChannelsById } =
  channelsAdapter.getSelectors((state) => state.channelsSetting.channels);

export const selectFilteredChannels = createSelector(
  [selectChannels, selectSearchText],
  (channels, searchText) => {
    if (searchText.length === 0) {
      return channels;
    }
    return FuseUtils.filterArrayByString(channels, searchText);
  }
);

// export const selectGroupedFilteredChannels = createSelector([selectFilteredChannels], (channels) => {
//   return channels
//     .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
//     .reduce((r, e) => {
//       // get first letter of name of current element
//       const group = e.name[0];
//       // if there is no property in accumulator with this letter create it
//       if (!r[group]) r[group] = { group, children: [e] };
//       // if there is push current element to children array for that letter
//       else r[group].children.push(e);
//       // return accumulator
//       return r;
//     }, {});
// });

const channelsSlice = createSlice({
  name: 'channelsSetting/channels',
  initialState: channelsAdapter.getInitialState({
    searchText: '',
  }),
  reducers: {
    setChannelsSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
  },
  extraReducers: {
    [updateLineChannel.fulfilled]: channelsAdapter.upsertOne,
    [addLineChannel.fulfilled]: channelsAdapter.addOne,
    [removeLineChannel.fulfilled]: (state, action) =>
      channelsAdapter.removeOne(state, action.payload),
    [addFacebookChannel.fulfilled]: channelsAdapter.addOne,
    [removeFacebookChannel.fulfilled]: (state, action) =>
      channelsAdapter.removeOne(state, action.payload),
    [addInstagramChannel.fulfilled]: channelsAdapter.addOne,
    [removeInstagramChannel.fulfilled]: (state, action) =>
      channelsAdapter.removeOne(state, action.payload),
    [getChannels.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      channelsAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
});

export const { setChannelsSearchText } = channelsSlice.actions;

export default channelsSlice.reducer;
