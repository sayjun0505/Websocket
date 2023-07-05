import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import history from '@history';
import { showMessage } from 'app/store/fuse/messageSlice';
import SectionModel from '../model/SectionModel';
import TaskModel from '../model/TaskModel';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTask = createAsyncThunk(
  'tasksApp/task/getTask',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/tasks`, {
        params: { id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      history.push({ pathname: `/apps/tasks` });
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);
export const getTaskforSocket = createAsyncThunk(
  'tasksApp/task/getTask',
  async (data, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // if (!token) return null;
      // const { organizationId } = getState().organization;
      // const response = await axios.get(`/api/${organizationId}/tasks`, {
      //   params: { id },
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const data = await response.data;
      return data;
    } catch (error) {
      history.push({ pathname: `/apps/tasks` });
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);

export const addTask = createAsyncThunk(
  'tasksApp/tasks/addTask',
  async (task, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/tasks`,
        { task },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      dispatch(showMessage({ message: 'Task added!', variant: 'success' }));
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Add Task error', variant: 'error' }));
      throw error;
    }
  }
);
export const addTaskforSocket = createAsyncThunk(
  'tasksApp/tasks/addTask',
  async (data, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // if (!token) return null;
      // const { organizationId } = getState().organization;
      // const response = await axios.post(
      //   `/api/${organizationId}/tasks`,
      //   { task },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // const data = await response.data;
      dispatch(showMessage({ message: 'Task added!', variant: 'success' }));
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Add Task error', variant: 'error' }));
      throw error;
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasksApp/tasks/updateTask',
  async (task, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/tasks`,
        { task },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      // dispatch(showMessage({ message: 'Task updated!', variant: 'success' }));
      console.error("orgs:",data)
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Task error', variant: 'error' }));
      throw error;
    }
  }
);
export const updateTaskforSocket = createAsyncThunk(
  'tasksApp/tasks/updateTask',
  async (data, { dispatch, getState }) => {
    try {
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Task error', variant: 'error' }));
      throw error;
    }
  }
);

export const removeTask = createAsyncThunk(
  'tasksApp/tasks/removeTask',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/tasks`, {
        params: { id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      await response.data;
      dispatch(showMessage({ message: 'Task removed!', variant: 'success' }));
      return id;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove Task error', variant: 'error' }));
      throw error;
    }
  }
);
export const removeTaskforSocket = createAsyncThunk(
  'tasksApp/tasks/removeTask',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/tasks`, {
        params: { id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      await response.data;
      dispatch(showMessage({ message: 'Task removed!', variant: 'success' }));
      return id;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove Task error', variant: 'error' }));
      throw error;
    }
  }
);

export const selectTask = ({ tasksApp }) => tasksApp.task;

const taskSlice = createSlice({
  name: 'tasksApp/task',
  initialState: null,
  reducers: {
    newTask: (state, action) => {
      const type = action.payload;
      if (type === 'section') {
        return SectionModel();
      }
      if (type === 'task') {
        return TaskModel();
      }
      return null;
    },
    resetTask: () => null,
  },
  extraReducers: {
    [getTask.pending]: (state, action) => null,
    [getTask.fulfilled]: (state, action) => action.payload,
    [updateTask.fulfilled]: (state, action) => action.payload,
    [updateTaskforSocket.fulfilled]: (state, action) => action.payload,
    [getTaskforSocket.fulfilled]: (state, action) => action.payload,
    [removeTask.fulfilled]: (state, action) => null,
    [removeTaskforSocket.fulfilled]: (state, action) => null,
  },
});

export const { resetTask, newTask } = taskSlice.actions;

export default taskSlice.reducer;
