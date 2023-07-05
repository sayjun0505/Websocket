import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../auth/services/firebaseService/firebaseAuthService';

export const getNotifications = createAsyncThunk('notificationPanel/getData', async () => {
  const token = await firebaseAuthService.getAccessToken();
  const response = await axios.get('/api/notification', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.data;

  return data;
});

export const dismissAll = createAsyncThunk('notificationPanel/dismissAll', async () => {
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

export const dismissItem = createAsyncThunk('notificationPanel/dismissItem', async (id) => {
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

export const addNotification = createAsyncThunk(
  'notificationPanel/addNotification',
  async (item) => {
    const response = await axios.post(`/api/notifications`, { ...item });
    const data = await response.data;

    return data;
  }
);

const notificationsAdapter = createEntityAdapter({});

const initialState = notificationsAdapter.upsertMany(notificationsAdapter.getInitialState(), []);

export const { selectAll: selectNotifications, selectById: selectNotificationsById } =
  notificationsAdapter.getSelectors((state) => state.notificationPanel.data);

const dataSlice = createSlice({
  name: 'notificationPanel/data',
  initialState,
  reducers: {},
  extraReducers: {
    [dismissItem.fulfilled]: (state, action) =>
      notificationsAdapter.removeOne(state, action.payload),
    [dismissAll.fulfilled]: (state, action) => notificationsAdapter.removeAll(state),
    [getNotifications.fulfilled]: (state, action) =>
      notificationsAdapter.addMany(state, action.payload),
    [addNotification.fulfilled]: (state, action) =>
      notificationsAdapter.addOne(state, action.payload),
  },
});

export default dataSlice.reducer;
