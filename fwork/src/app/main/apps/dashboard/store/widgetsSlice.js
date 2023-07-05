import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getSummary = createAsyncThunk(
  'DashboardApp/widgets/getSummary',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const dashboardData = await response.data;
      const data = [
        {
          id: 'allChat',
          title: 'Total Chat',
          data: dashboardData.allChat,
        },
        {
          id: 'openChat',
          title: 'Open Chats',
          data: {
            name: 'Open',
            count: dashboardData.openChat,
          },
          detail: '',
        },
        {
          id: 'messageToday',
          title: 'Message Today',
          count: dashboardData.todayMessage,
        },
        {
          id: 'allMessage',
          title: 'ALl Message',
          count: dashboardData.allMessage,
        },
        {
          id: 'contacts',
          title: 'Contacts',
          data: {
            name: 'Total Customer',
            count: dashboardData.TotalCustomer,
          },
          detail: '',
        },
        {
          id: 'chatHq',
          title: 'Chat HQ',
          data: {
            HqUserList: dashboardData.dashboardHqUserList,
          },
        },
        {
          id: 'comments',
          title: 'Comments',
          data: {
            comments: dashboardData.dashboardCommentsList,
          },
        },
        {
          id: 'channels',
          title: 'Channels',
          data: {
            channels: dashboardData.dashboardChannels,
          },
        },
        {
          id: 'kanbanBoards',
          title: 'Kanban Board',
          data: {
            kanbans: dashboardData.dashboardKanbanBooards,
          },
        },
        {
          id: 'tasks',
          title: 'Tasks',
          data: {
            tasks: dashboardData.dashboardTasks,
          },
        },
        {
          id: 'users',
          data: dashboardData.dashboardUsers,
        },
        {
          id: 'resolvedChats',
          title: 'ResolvedChats',
          data: {
            name: 'Resolved',
            count: dashboardData.resovedChats,
          },
        },
        {
          id: 'inboxSummary',
          title: 'InboxSummary',
          data: dashboardData.inboxSummary,
        },
      ];
      return data;
    } catch (error) {
      // console.error('GetSummary ', error);
      dispatch(showMessage({ message: 'Get Dashboard data error', variant: 'error' }));
      throw error;
    }
  }
);
export const getSummaryforSocket = createAsyncThunk(
  'DashboardApp/widgets/getSummary',
  async (dashboardData, { dispatch, getState }) => {
    try {
      const data = [
        {
          id: 'allChat',
          title: 'Total Chat',
          data: dashboardData.allChat,
        },
        {
          id: 'openChat',
          title: 'Open Chats',
          data: {
            name: 'Open',
            count: dashboardData.openChat,
          },
          detail: '',
        },
        {
          id: 'messageToday',
          title: 'Message Today',
          count: dashboardData.todayMessage,
        },
        {
          id: 'allMessage',
          title: 'ALl Message',
          count: dashboardData.allMessage,
        },
        {
          id: 'contacts',
          title: 'Contacts',
          data: {
            name: 'Total Customer',
            count: dashboardData.TotalCustomer,
          },
          detail: '',
        },
        {
          id: 'chatHq',
          title: 'Chat HQ',
          data: {
            HqUserList: dashboardData.dashboardHqUserList,
          },
        },
        {
          id: 'comments',
          title: 'Comments',
          data: {
            comments: dashboardData.dashboardCommentsList,
          },
        },
        {
          id: 'channels',
          title: 'Channels',
          data: {
            channels: dashboardData.dashboardChannels,
          },
        },
        {
          id: 'kanbanBoards',
          title: 'Kanban Board',
          data: {
            kanbans: dashboardData.dashboardKanbanBooards,
          },
        },
        {
          id: 'tasks',
          title: 'Tasks',
          data: {
            tasks: dashboardData.dashboardTasks,
          },
        },
        {
          id: 'users',
          data: dashboardData.dashboardUsers,
        },
        {
          id: 'resolvedChats',
          title: 'ResolvedChats',
          data: {
            name: 'Resolved',
            count: dashboardData.resovedChats,
          },
        },
        {
          id: 'inboxSummary',
          title: 'InboxSummary',
          data: dashboardData.inboxSummary,
        },
      ];
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Dashboard data error', variant: 'error' }));
      throw error;
    }
  }
);


const widgetsAdapter = createEntityAdapter({});

export const { selectEntities: selectWidgetsEntities, selectById: selectWidgetById } =
  widgetsAdapter.getSelectors((state) => state.DashboardApp.widgets);

const widgetsSlice = createSlice({
  name: 'DashboardApp/widgets',
  initialState: widgetsAdapter.getInitialState({}),
  reducers: {},
  extraReducers: {
    [getSummary.fulfilled]: (state, action) => {
      widgetsAdapter.setAll(state, action.payload);
    },
    [getSummaryforSocket.fulfilled]: (state, action) => {
      widgetsAdapter.setAll(state, action.payload);
    },
  },
});

export default widgetsSlice.reducer;
