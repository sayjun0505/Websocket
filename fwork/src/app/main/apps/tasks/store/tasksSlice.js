import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { addTask, removeTask, updateTask } from './taskSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const getTasks = createAsyncThunk(
  'tasksApp/tasks/getTasks',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/tasks/list`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      console.error("org:",data)
      return data;
    } catch (error) {
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);
export const getTasksforSocket = createAsyncThunk(
  'tasksApp/tasks/getTasks',
  async (data, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // if (!token) return null;
      // const { organizationId } = getState().organization;
      // const response = await axios.get(`/api/${organizationId}/tasks/list`, {
      //   params,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const data = await response.data;
      console.error("data:",data)
      return data;
    } catch (error) {
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);

export const reorderList = createAsyncThunk(
  'tasksApp/tasks/reorder',
  async ({ arr, startIndex, endIndex }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;

      // const ordered = reorder(arr, startIndex, endIndex);

      const response = await axios.post(
        `/api/${organizationId}/tasks/reorder`,
        { startIndex, endIndex },
        // { ordered },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;

      dispatch(
        showMessage({
          message: 'List Order Saved',
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
          variant: 'success',
        })
      );
      return data;
    } catch (error) {
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);

const tasksAdapter = createEntityAdapter({});

export const { selectAll: selectTasks, selectById: selectTasksById } = tasksAdapter.getSelectors(
  (state) => state.tasksApp.tasks
);

export const selectRemainingTasks = createSelector([selectTasks], (tasks) => {
  return tasks.filter((item) => item.type === 'task' && !item.completed).length;
});

const tasksSlice = createSlice({
  name: 'tasksApp/tasks',
  initialState: tasksAdapter.getInitialState(),
  extraReducers: {
    [reorderList.pending]: (state, action) => {
      const { arr, startIndex, endIndex } = action.meta.arg;
      tasksAdapter.setAll(state, reorder(arr, startIndex, endIndex));
    },
    [reorderList.fulfilled]: tasksAdapter.setAll,
    [updateTask.fulfilled]: tasksAdapter.upsertOne,
    [addTask.fulfilled]: tasksAdapter.addOne,
    // [updateTaskforSocket.fulfilled]: tasksAdapter.upsertOne,
    // [addTaskforSocket.fulfilled]: tasksAdapter.addOne,
    [removeTask.fulfilled]: (state, action) => tasksAdapter.removeOne(state, action.payload),
    [getTasks.fulfilled]: tasksAdapter.setAll,
    [getTasksforSocket.fulfilled]: tasksAdapter.setAll,
  },
});

export const { setTasksSearchText } = tasksSlice.actions;

export default tasksSlice.reducer;
