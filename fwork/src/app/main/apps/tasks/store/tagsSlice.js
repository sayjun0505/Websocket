import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getTags = createAsyncThunk(
  'tasksApp/tags/getTags',
  async (data, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/tasks/tags/list`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);
export const getTagsforSocket = createAsyncThunk(
  'tasksApp/tags/getTags',
  async (data, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // if (!token) return null;
      // const { organizationId } = getState().organization;
      // const response = await axios.get(`/api/${organizationId}/tasks/tags/list`, {
      //   params,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const data = await response.data;
      return data;
    } catch (error) {
      dispatch(showMessage({ message: error.message, variant: 'error' }));
      return null;
    }
  }
);

export const getTag = createAsyncThunk(
  'tasksApp/tags/getTags',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.get(`/api/${organizationId}/tasks/tags`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const tags = await response.data;
      return tags;
    } catch (error) {
      dispatch(showMessage({ message: 'Get Tasks tag error', variant: 'error' }));
      throw error;
    }
  }
);

export const addTag = createAsyncThunk(
  'tasksApp/tags/addTag',
  async (tags, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/tasks/tags`,
        { tags },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.data;
      // await dispatch(getTags());
      dispatch(showMessage({ message: 'Tasks tag added!', variant: 'success' }));
      return data;
    } catch (error) {
      dispatch(showMessage({ message: 'Add Tasks tag error', variant: 'error' }));
      throw error;
    }
  }
);

export const removeTag = createAsyncThunk(
  'tasksApp/tags/removeTag',
  async (id, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      if (!token) return null;
      const { organizationId } = getState().organization;
      const response = await axios.delete(`/api/${organizationId}/tasks/tags`, {
        params: { id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      await response.data;
      dispatch(showMessage({ message: 'Tasks tag removed!', variant: 'success' }));
      return id;
    } catch (error) {
      dispatch(showMessage({ message: 'Remove Tasks tag error', variant: 'error' }));
      throw error;
    }
  }
);

const tagsAdapter = createEntityAdapter({});

export const { selectAll: selectTags, selectById: selectTagsById } = tagsAdapter.getSelectors(
  (state) => state.tasksApp.tags
);

const tagsSlice = createSlice({
  name: 'tasksApp/tags',
  initialState: tagsAdapter.getInitialState([]),
  reducers: {},
  extraReducers: {
    [getTags.fulfilled]: tagsAdapter.setAll,
    [getTagsforSocket.fulfilled]: tagsAdapter.setAll,
    [addTag.fulfilled]: tagsAdapter.setAll,
    // [addTag.fulfilled]: (state, action) => {
    //   tagsAdapter.addMany(state, action.payload);
    // },
    [removeTag.fulfilled]: tagsAdapter.removeOne,
  },
});

export default tagsSlice.reducer;
