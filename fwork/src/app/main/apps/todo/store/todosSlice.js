import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { getLabels } from './labelsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTodos = createAsyncThunk(
  'todoApp/todos/getTodos',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/todo/list`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const todos = await response.data;
      return todos;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Todo List error', variant: 'error' }));
      throw error;
    }
  }
);

export const addTodo = createAsyncThunk(
  'todoApp/todos/addTodo',
  async ({ todo }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/todo`,
        { todo },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const todos = await response.data;
      dispatch(getTodos({ filter: 'all' }));
      dispatch(getLabels());
      dispatch(showMessage({ message: 'Todo added!', variant: 'success' }));
      return todos;
    } catch (error) {
      dispatch(showMessage({ message: 'Add Todo error', variant: 'error' }));
      throw error;
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todoApp/todos/updateTodo',
  async ({ todo }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/todo`,
        { todo },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const todos = await response.data;
      dispatch(getTodos({ filter: 'all' }));
      dispatch(getLabels());
      dispatch(showMessage({ message: 'Todo updated!', variant: 'success' }));
      return todos;
    } catch (error) {
      dispatch(showMessage({ message: 'Update Todo error', variant: 'error' }));
      throw error;
    }
  }
);

export const removeTodo = createAsyncThunk(
  'todoApp/todos/removeTodo',
  async (todoId, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/todo`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: { id: todoId },
      });
      const todos = await response.data;
      dispatch(getTodos({ filter: 'all' }));
      dispatch(showMessage({ message: 'Todo removed!', variant: 'success' }));
      return todos;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove Todo error', variant: 'error' }));
      throw error;
    }
  }
);

const todosAdapter = createEntityAdapter({});

export const { selectAll: selectTodos, selectById: selectTodosById } = todosAdapter.getSelectors(
  (state) => state.todoApp.todos
);

const todosSlice = createSlice({
  name: 'todoApp/todos',
  initialState: todosAdapter.getInitialState({
    searchText: '',
    orderBy: '',
    orderDescending: false,
    routeParams: {},
    todoDialog: {
      type: 'new',
      props: {
        open: false,
      },
      data: null,
    },
  }),
  reducers: {
    setTodosSearchText: {
      reducer: (state, action) => {
        state.searchText = action.payload;
      },
      prepare: (event) => ({ payload: event.target.value || '' }),
    },
    toggleOrderDescending: (state, action) => {
      state.orderDescending = !state.orderDescending;
    },
    changeOrder: (state, action) => {
      state.orderBy = action.payload;
    },
    openNewTodoDialog: (state, action) => {
      state.todoDialog = {
        type: 'new',
        props: {
          open: true,
          selectedAccount: action.payload,
        },
        data: null,
      };
    },
    closeNewTodoDialog: (state, action) => {
      state.todoDialog = {
        type: 'new',
        props: {
          open: false,
        },
        data: null,
      };
    },
    openEditTodoDialog: (state, action) => {
      state.todoDialog = {
        type: 'edit',
        props: {
          open: true,
        },
        data: action.payload,
      };
    },
    closeEditTodoDialog: (state, action) => {
      state.todoDialog = {
        type: 'edit',
        props: {
          open: false,
        },
        data: null,
      };
    },
  },
  extraReducers: {
    [updateTodo.fulfilled]: todosAdapter.upsertOne,
    [addTodo.fulfilled]: todosAdapter.addOne,
    [getTodos.fulfilled]: (state, action) => {
      // const { data, routeParams } = action.payload;
      todosAdapter.setAll(state, action.payload);
      // state.routeParams = routeParams;
      state.searchText = '';
    },
  },
});

export const {
  setTodosSearchText,
  toggleOrderDescending,
  changeOrder,
  openNewTodoDialog,
  closeNewTodoDialog,
  openEditTodoDialog,
  closeEditTodoDialog,
} = todosSlice.actions;

export default todosSlice.reducer;
