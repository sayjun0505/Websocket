import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';
import firebaseAuthService from '../../../auth/services/firebaseService/firebaseAuthService';

export const getActivations = createAsyncThunk(
  'organizationsApp/activations/getActivations',
  async () => {
    const token = await firebaseAuthService.getAccessToken();
    const response = await axios.get('/api/activations', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.data;
    return { data };
  }
);
export const getActivationsforSocket = createAsyncThunk(
  'organizationsApp/activations/getActivations',
  async (data) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const response = await axios.get('/api/activations', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // const data = await response.data;
    
    console.loag("socket",data)
    return  data ;
    
  }
);


export const addInviteCodeforSocket = createAsyncThunk(
  'organizationsApp/activation/addActivation',
  async (newData, { dispatch, getState }) => {  
    console.log("newData",newData)
    return newData;
  }
);
export const addInviteCode = createAsyncThunk(
  'organizationsApp/activation/addActivation',
  async (newData, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    const response = await axios.post(`/api/activation/invite`, newData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const activationResult = await response.data;

    return activationResult;
  }
);

const activationsAdapter = createEntityAdapter({});

export const { selectAll: selectActivations, selectById: selectActivationsById } =
  activationsAdapter.getSelectors((state) => state.organizationsApp.activations);

export const selectFilteredActiveActivations = createSelector(
  [selectActivations],
  (activations) => {
    return activations.filter((activation) => activation.status === 'active');
  }
);
export const selectFreeActiveActivations = createSelector([selectActivations], (activations) => {
  return activations.find((activation) => activation.package.isFree);
});

export const selectOrganizationsFreeSlot = createSelector(
  [selectFilteredActiveActivations],
  (activations) => {
    if (!activations || activations.length === 0) return 0;
    if (activations.filter((activation) => activation.package.organizationLimit < 0).length > 0) {
      return -1;
    }
    if (activations.length === 1)
      return activations[0].package.organizationLimit - activations[0].organization;

    let organizationLimit = 0;
    let organizationCount = 0;
    activations.forEach((activation) => {
      organizationLimit += activation.package.organizationLimit;
      organizationCount += activation.organization;
    });
    return organizationLimit - organizationCount;
  }
);

const activationsSlice = createSlice({
  name: 'organizationsApp/activations',
  initialState: activationsAdapter.getInitialState({}),
  reducers: {
    setActivationsforSocket:(state, action) => {
      const  data = action.payload;
      activationsAdapter.setAll(state, data);
      state.searchText = '';
    },
  },
  extraReducers: {
    [getActivations.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      activationsAdapter.setAll(state, data);
      state.searchText = '';
    },
    [getActivationsforSocket.fulfilled]: (state, action) => {
      const { data, routeParams } = action.payload;
      activationsAdapter.setAll(state, data);
      state.searchText = '';
    },
    [addInviteCode.fulfilled]: activationsAdapter.addOne,
  },
});
export const { setActivationsforSocket} =activationsSlice.actions;
export default activationsSlice.reducer;
