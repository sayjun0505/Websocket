import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../auth/services/firebaseService/firebaseAuthService';

export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) {
        return [];
      }
      const response = await axios.get(`/api/notification`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const notifications = await response.data;
      // console.error('Notification ', notifications);
      // dispatch(setUnread(notifications.unread));
      dispatch(setPages(notifications.pages));
      dispatch(setCurrentPage(notifications.currentPage));
      return notifications.data;
    } catch (error) {
      // console.log('Notification error ', error);
      dispatch(showMessage({ message: 'Get Notifications error1', variant: 'error' }));
      throw error;
    }
  }
);

export const readAll = createAsyncThunk('notifications/readAll', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.delete('/api/notification/readAll', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  await response.data;

  return true;
});

export const readItem = createAsyncThunk('notifications/readItem', async (id) => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.delete(`/api/notification/read/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  await response.data;

  return id;
});

// export const unReadItem = createAsyncThunk('notifications/unReadItem', async (id) => {
//   const token = await firebaseAuthService.getAccessToken();
//   const response = await axios.delete(`/api/notification/read/${id}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   await response.data;

//   return id;
// });

export const dismissAll = createAsyncThunk('notifications/dismissAll', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.delete('/api/notification/dismissAll', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  await response.data;

  return true;
});

export const dismissItem = createAsyncThunk('notifications/dismissItem', async (id) => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.delete(`/api/notification/dismiss/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  await response.data;

  return id;
});

export const updateFCMToken = createAsyncThunk(
  'notifications/updateFCMToken',
  async (FCMToken, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return {};
      const response = await axios.put(
        `/api/notification/token`,
        { token: FCMToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userSetting = await response.data;
      // console.error("updateFCMToken:",userSetting)
      return userSetting;
    } catch (error) {
      // console.error('[notifications/updateFCMToken] ', error);
      dispatch(
        showMessage({
          message: 'update FCM Token error!',
          autoHideDuration: 3000,
          variant: 'error',
        })
      );
      return {};
    }
  }
);

const notificationsAdapter = createEntityAdapter({});

const initialState = notificationsAdapter.getInitialState({
  currentPage: null,
  pages: null,
  // unread: 0,
});

export const { selectAll: selectNotifications, selectById: selectNotificationById } =
  notificationsAdapter.getSelectors((state) => state.notifications);

// export const selectUnReadCount = ({ notifications }) => notifications.unread;
export const selectPages = ({ notifications }) => notifications.pages;
export const selectCurrentPage = ({ notifications }) => notifications.currentPage;

export const selectLoadMoreState = createSelector(
  [selectPages, selectCurrentPage],
  (pages, currentPage) => {
    if (currentPage < pages) {
      return true;
    }
    return false;
  }
);
export const selectOrderNotifications = createSelector([selectNotifications], (notifications) => {
  return notifications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotification: (state, action) => initialState,
    // setUnread: (state, action) => {
    //   state.unread = action.payload;
    // },
    setPages: (state, action) => {
      state.pages = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setNotificationforSocket:(state, action) => {
      notificationsAdapter.setAll(state, action.payload)
    },
  },
  extraReducers: {
    [getNotifications.fulfilled]: (state, action) =>
      notificationsAdapter.setAll(state, action.payload),
    [dismissItem.fulfilled]: (state, action) =>
      notificationsAdapter.removeOne(state, action.payload),
    [dismissAll.fulfilled]: (state, action) => notificationsAdapter.removeAll(state),
  },
});

export const { setCurrentPage, clearNotification, setNotificationforSocket,setPages } = notificationSlice.actions;

export default notificationSlice.reducer;
