import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
// import axios from 'axios';

export const getFilters = createAsyncThunk('todoApp/filters/getFilters', async () => {
  // const response = await axios.get('/api/todo-app/filters');
  // const data = await response.data;

  return [
    {
      id: 0,
      handle: 'starred',
      title: 'Starred',
      icon: 'star',
    },
    {
      id: 1,
      handle: 'important',
      title: 'Priority',
      icon: 'error',
    },
    {
      id: 2,
      handle: 'dueDate',
      title: 'Sheduled',
      icon: 'schedule',
    },
    {
      id: 3,
      handle: 'today',
      title: 'Today',
      icon: 'today',
    },
    {
      id: 4,
      handle: 'completed',
      title: 'Done',
      icon: 'check',
    },
    {
      id: 5,
      handle: 'deleted',
      title: 'Deleted',
      icon: 'delete',
    },
  ];
});

const filtersAdapter = createEntityAdapter({});

export const { selectAll: selectFilters, selectById: selectFilterById } =
  filtersAdapter.getSelectors((state) => state.todoApp.filters);

const filtersSlice = createSlice({
  name: 'todoApp/filters',
  initialState: filtersAdapter.getInitialState({}),
  reducers: {},
  extraReducers: {
    [getFilters.fulfilled]: filtersAdapter.setAll,
  },
});

export default filtersSlice.reducer;
